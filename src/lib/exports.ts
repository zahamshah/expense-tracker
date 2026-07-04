import "server-only";

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { ExpenseListItem } from "@/lib/types";

type ExportFile = {
  body: Buffer;
  contentType: string;
  filename: string;
};

export async function buildExpenseExport(
  format: "csv" | "xlsx" | "pdf",
  expenses: ExpenseListItem[],
): Promise<ExportFile> {
  switch (format) {
    case "xlsx":
      return {
        body: await buildExcel(expenses),
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: "warehouse-expenses.xlsx",
      };
    case "pdf":
      return {
        body: await buildPdf(expenses),
        contentType: "application/pdf",
        filename: "warehouse-expenses.pdf",
      };
    case "csv":
    default:
      return {
        body: Buffer.from(buildCsv(expenses), "utf8"),
        contentType: "text/csv; charset=utf-8",
        filename: "warehouse-expenses.csv",
      };
  }
}

export function buildCsv(expenses: ExpenseListItem[]) {
  const rows = [
    ["Date", "Description", "Category", "Paid By", "Amount", "Notes", "Receipt"],
    ...expenses.map((expense) => [
      formatDisplayDate(expense.date),
      expense.description,
      expense.category.name,
      expense.paidBy.name,
      formatMoney(expense.amountPence),
      expense.notes ?? "",
      expense.receipt?.url ?? "",
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

async function buildExcel(expenses: ExpenseListItem[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Warehouse Expense Tracker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Expenses", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Date", key: "date", width: 16 },
    { header: "Description", key: "description", width: 34 },
    { header: "Category", key: "category", width: 20 },
    { header: "Paid By", key: "paidBy", width: 18 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Notes", key: "notes", width: 40 },
    { header: "Receipt", key: "receipt", width: 48 },
  ];

  for (const expense of expenses) {
    sheet.addRow({
      date: formatDisplayDate(expense.date),
      description: expense.description,
      category: expense.category.name,
      paidBy: expense.paidBy.name,
      amount: expense.amountPence / 100,
      notes: expense.notes ?? "",
      receipt: expense.receipt?.url ?? "",
    });
  }

  sheet.getRow(1).font = { bold: true };
  sheet.getColumn("amount").numFmt = "£#,##0.00";

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function buildPdf(expenses: ExpenseListItem[]) {
  const doc = new PDFDocument({ margin: 42, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(18).text("Warehouse Expenses", { align: "left" });
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#64748b").text(`Generated ${formatDisplayDate(new Date())}`);
  doc.moveDown(1);

  const total = expenses.reduce((sum, expense) => sum + expense.amountPence, 0);
  doc.fillColor("#111827").fontSize(12).text(`Total exported: ${formatMoney(total)}`);
  doc.moveDown(0.8);

  for (const expense of expenses) {
    if (doc.y > 730) doc.addPage();

    doc
      .fontSize(10)
      .fillColor("#111827")
      .text(`${formatDisplayDate(expense.date)} / ${expense.category.name} / ${expense.paidBy.name}`);
    doc
      .fontSize(11)
      .fillColor("#020617")
      .text(`${expense.description} - ${formatMoney(expense.amountPence)}`);

    if (expense.notes) {
      doc.fontSize(9).fillColor("#64748b").text(truncate(expense.notes, 130));
    }

    doc.moveDown(0.6);
  }

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

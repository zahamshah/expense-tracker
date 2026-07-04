"use server";

import { revalidatePath } from "next/cache";
import { dateInputToUtcDate } from "@/lib/dates";
import { parsePoundsToPence } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { deleteReceiptBlob, uploadReceiptFile, type UploadedReceipt } from "@/lib/storage";
import { expenseFormSchema } from "@/lib/validations";

type ActionResult = {
  ok: boolean;
  message: string;
  warning?: string;
};

export async function saveExpenseAction(formData: FormData): Promise<ActionResult> {
  const parsed = expenseFormSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    date: formData.get("date")?.toString() ?? "",
    amount: formData.get("amount")?.toString() ?? "",
    categoryId: formData.get("categoryId")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    paidById: formData.get("paidById")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the expense details and try again.",
    };
  }

  let uploadedReceipt: UploadedReceipt | null = null;
  const receiptValue = formData.get("receipt");
  const receiptFile = receiptValue instanceof File && receiptValue.size > 0 ? receiptValue : null;

  try {
    if (receiptFile) {
      uploadedReceipt = await uploadReceiptFile(receiptFile);
    }

    const data = parsed.data;
    const amountPence = parsePoundsToPence(data.amount);
    const notes = data.notes?.trim() ? data.notes.trim() : null;
    const previousExpense = data.id
      ? await prisma.expense.findUnique({
          where: { id: data.id },
          include: { receipt: true },
        })
      : null;

    if (data.id) {
      await prisma.expense.update({
        where: { id: data.id },
        data: {
          date: dateInputToUtcDate(data.date),
          amountPence,
          description: data.description.trim(),
          notes,
          category: { connect: { id: data.categoryId } },
          paidBy: { connect: { id: data.paidById } },
          ...(uploadedReceipt
            ? {
                receipt: {
                  upsert: {
                    create: uploadedReceipt,
                    update: uploadedReceipt,
                  },
                },
              }
            : {}),
        },
      });
    } else {
      await prisma.expense.create({
        data: {
          date: dateInputToUtcDate(data.date),
          amountPence,
          description: data.description.trim(),
          notes,
          category: { connect: { id: data.categoryId } },
          paidBy: { connect: { id: data.paidById } },
          ...(uploadedReceipt ? { receipt: { create: uploadedReceipt } } : {}),
        },
      });
    }

    const warning =
      uploadedReceipt && previousExpense?.receipt?.pathname
        ? await tryDeletePreviousReceipt(previousExpense.receipt.pathname)
        : undefined;

    revalidateExpenseViews();

    return {
      ok: true,
      message: data.id ? "Expense updated." : "Expense saved.",
      warning,
    };
  } catch (error) {
    if (uploadedReceipt) {
      await deleteReceiptBlob(uploadedReceipt.pathname).catch(() => undefined);
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save the expense.",
    };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { receipt: true },
  });

  if (!expense) {
    return {
      ok: false,
      message: "Expense was already deleted.",
    };
  }

  await prisma.expense.delete({ where: { id } });

  const warning = expense.receipt?.pathname
    ? await tryDeletePreviousReceipt(expense.receipt.pathname)
    : undefined;

  revalidateExpenseViews();

  return {
    ok: true,
    message: "Expense deleted.",
    warning,
  };
}

async function tryDeletePreviousReceipt(pathname: string) {
  try {
    await deleteReceiptBlob(pathname);
    return undefined;
  } catch {
    return "The expense was saved, but the previous receipt file could not be removed from Blob storage.";
  }
}

function revalidateExpenseViews() {
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/reconciliation");
  revalidatePath("/reports");
}

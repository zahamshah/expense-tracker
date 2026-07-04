"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ExpenseRowActions } from "@/components/expenses/expense-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type {
  CategoryOption,
  ExpenseFilters,
  ExpensePageData,
  PartnerOption,
} from "@/lib/types";

type ExpenseTableProps = {
  expensePage: ExpensePageData;
  filters: ExpenseFilters;
  categories: CategoryOption[];
  partners: PartnerOption[];
  onSort: (sort: ExpenseFilters["sort"]) => void;
  onPageChange: (page: number) => void;
};

const sortCycle: Record<string, ExpenseFilters["sort"]> = {
  date: "date-asc",
  amount: "amount-desc",
  category: "category-asc",
  paidBy: "paidBy-asc",
};

export function ExpenseTable({
  expensePage,
  filters,
  categories,
  partners,
  onSort,
  onPageChange,
}: ExpenseTableProps) {
  const start = expensePage.total === 0 ? 0 : (expensePage.page - 1) * expensePage.pageSize + 1;
  const end = Math.min(expensePage.page * expensePage.pageSize, expensePage.total);

  function nextSort(column: keyof typeof sortCycle) {
    if (column === "date") {
      return filters.sort === "date-desc" ? "date-asc" : "date-desc";
    }

    if (column === "amount") {
      return filters.sort === "amount-desc" ? "amount-asc" : "amount-desc";
    }

    return sortCycle[column];
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Expense Table</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {start}-{end} of {expensePage.total}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton label="Date" onClick={() => onSort(nextSort("date"))} />
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <SortButton label="Category" onClick={() => onSort(nextSort("category"))} />
              </TableHead>
              <TableHead>
                <SortButton label="Paid By" onClick={() => onSort(nextSort("paidBy"))} />
              </TableHead>
              <TableHead className="text-right">
                <SortButton label="Amount" onClick={() => onSort(nextSort("amount"))} align="right" />
              </TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expensePage.expenses.length ? (
              expensePage.expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatDisplayDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-72">
                      <p className="font-medium">{expense.description}</p>
                      {expense.notes ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{expense.notes}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: expense.category.color }}
                      />
                      {expense.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.paidBy.name}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatMoney(expense.amountPence)}
                  </TableCell>
                  <TableCell>
                    {expense.receipt ? (
                      <Button asChild variant="ghost" size="sm" className="gap-2">
                        <a href={expense.receipt.url} target="_blank" rel="noreferrer">
                          <FileText className="size-4" />
                          View
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ExpenseRowActions
                      expense={expense}
                      categories={categories}
                      partners={partners}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No expenses match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {expensePage.page} of {expensePage.pageCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={expensePage.page <= 1}
              onClick={() => onPageChange(expensePage.page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={expensePage.page >= expensePage.pageCount}
              onClick={() => onPageChange(expensePage.page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortButton({
  label,
  align = "left",
  onClick,
}: {
  label: string;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md py-1 text-xs font-medium uppercase text-muted-foreground hover:text-foreground ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      {label}
      <ArrowUpDown className="size-3" />
    </button>
  );
}

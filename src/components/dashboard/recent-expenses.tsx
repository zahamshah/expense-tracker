import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { ExpenseListItem } from "@/lib/types";

type RecentExpensesProps = {
  expenses: ExpenseListItem[];
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle>Recent Expenses</CardTitle>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/expenses">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length ? (
          <div className="divide-y">
            {expenses.map((expense) => (
              <div key={expense.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{expense.description}</p>
                    <Badge variant="secondary" className="gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: expense.category.color }}
                      />
                      {expense.category.name}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatDisplayDate(expense.date)}</span>
                    <span>{expense.paidBy.name}</span>
                    {expense.receipt ? (
                      <a
                        href={expense.receipt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <FileText className="size-3.5" />
                        Receipt
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="text-lg font-semibold">{formatMoney(expense.amountPence)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No expenses have been recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

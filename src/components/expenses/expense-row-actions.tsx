"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteExpenseAction } from "@/app/expenses/actions";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryOption, ExpenseListItem, PartnerOption } from "@/lib/types";

type ExpenseRowActionsProps = {
  expense: ExpenseListItem;
  categories: CategoryOption[];
  partners: PartnerOption[];
};

export function ExpenseRowActions({ expense, categories, partners }: ExpenseRowActionsProps) {
  const router = useRouter();
  const [message, setMessage] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${expense.description}"?`)) return;

    setIsDeleting(true);
    const result = await deleteExpenseAction(expense.id);
    setIsDeleting(false);

    if (!result.ok || result.warning) {
      setMessage(result.warning ?? result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {message ? <span className="max-w-48 text-xs text-muted-foreground">{message}</span> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Expense actions">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Expense actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ExpenseDialog
            expense={expense}
            categories={categories}
            partners={partners}
            trigger={
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                }}
                className="gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={handleDelete}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

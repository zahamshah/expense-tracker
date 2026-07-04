"use client";

import * as React from "react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CategoryOption, ExpenseListItem, PartnerOption } from "@/lib/types";

type ReferenceData = {
  categories: CategoryOption[];
  partners: PartnerOption[];
};

type ExpenseDialogProps = {
  trigger: React.ReactNode;
  expense?: ExpenseListItem;
  categories?: CategoryOption[];
  partners?: PartnerOption[];
  onSaved?: () => void;
};

export function ExpenseDialog({
  trigger,
  expense,
  categories,
  partners,
  onSaved,
}: ExpenseDialogProps) {
  const [open, setOpen] = React.useState(false);
  const providedReferenceData = React.useMemo(
    () => (categories && partners ? { categories, partners } : null),
    [categories, partners],
  );
  const [loadedReferenceData, setLoadedReferenceData] = React.useState<ReferenceData | null>(null);
  const referenceData = providedReferenceData ?? loadedReferenceData;
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || referenceData) return;

    let isMounted = true;

    fetch("/api/reference")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load form options.");
        return (await response.json()) as ReferenceData;
      })
      .then((data) => {
        if (isMounted) setLoadedReferenceData(data);
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : "Could not load form.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, referenceData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            Track warehouse spending and keep partner balances current.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : referenceData ? (
          <ExpenseForm
            expense={expense}
            categories={referenceData.categories}
            partners={referenceData.partners}
            onSaved={() => {
              setOpen(false);
              onSaved?.();
            }}
          />
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        )}
      </DialogContent>
    </Dialog>
  );
}

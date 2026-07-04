"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveExpenseAction } from "@/app/expenses/actions";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput } from "@/lib/dates";
import { penceToPoundsInput } from "@/lib/money";
import type { CategoryOption, ExpenseListItem, PartnerOption } from "@/lib/types";
import { expenseClientSchema, type ExpenseFormValues } from "@/lib/validations";

type ExpenseFormProps = {
  expense?: ExpenseListItem;
  categories: CategoryOption[];
  partners: PartnerOption[];
  onSaved?: () => void;
};

export function ExpenseForm({ expense, categories, partners, onSaved }: ExpenseFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = React.useState<string | null>(null);
  const [serverWarning, setServerWarning] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseClientSchema),
    defaultValues: getDefaultValues(expense),
  });

  React.useEffect(() => {
    form.reset(getDefaultValues(expense));
  }, [expense, form]);

  async function onSubmit(values: ExpenseFormValues) {
    setIsSaving(true);
    setServerMessage(null);
    setServerWarning(null);

    const formData = new FormData();

    if (expense?.id) formData.set("id", expense.id);
    formData.set("date", values.date);
    formData.set("amount", values.amount);
    formData.set("categoryId", values.categoryId);
    formData.set("description", values.description);
    formData.set("paidById", values.paidById);
    formData.set("notes", values.notes ?? "");

    const receiptFiles = values.receipt as FileList | undefined;
    const receipt = receiptFiles?.item(0);
    if (receipt) formData.set("receipt", receipt);

    const result = await saveExpenseAction(formData);

    setIsSaving(false);

    if (!result.ok) {
      setServerMessage(result.message);
      return;
    }

    if (result.warning) {
      setServerWarning(result.warning);
      return;
    }

    router.refresh();
    onSaved?.();
    if (!expense) form.reset(getDefaultValues());
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {serverMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverMessage}
        </div>
      ) : null}

      {serverWarning ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {serverWarning}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" error={form.formState.errors.date?.message}>
          <Input type="date" {...form.register("date")} />
        </Field>

        <Field label="Amount (£)" error={form.formState.errors.amount?.message}>
          <Input inputMode="decimal" placeholder="0.00" {...form.register("amount")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={form.formState.errors.categoryId?.message}>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Who Paid / Account" error={form.formState.errors.paidById?.message}>
          <Controller
            control={form.control}
            name="paidById"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field label="Description" error={form.formState.errors.description?.message}>
        <Input placeholder="e.g. Boxes for outgoing inventory" {...form.register("description")} />
      </Field>

      <Field label="Receipt Upload" error={form.formState.errors.receipt?.message?.toString()}>
        <Input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          {...form.register("receipt")}
        />
        {expense?.receipt ? (
          <a
            href={expense.receipt.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Current receipt: {expense.receipt.filename}
          </a>
        ) : null}
      </Field>

      <Field label="Notes" error={form.formState.errors.notes?.message}>
        <Textarea placeholder="Optional internal context" {...form.register("notes")} />
      </Field>

      <DialogFooter>
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {expense ? "Save Changes" : "Save Expense"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function getDefaultValues(expense?: ExpenseListItem): ExpenseFormValues {
  return {
    date: expense ? formatDateInput(expense.date) : formatDateInput(new Date()),
    amount: expense ? penceToPoundsInput(expense.amountPence) : "",
    categoryId: expense?.category.id ?? "",
    description: expense?.description ?? "",
    paidById: expense?.paidBy.id ?? "",
    notes: expense?.notes ?? "",
    receipt: undefined,
  };
}

"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseFiltersToParams } from "@/lib/query-params";
import type {
  CategoryOption,
  ExpenseFilters,
  ExpensePageData,
  PartnerOption,
} from "@/lib/types";

type ExpensesClientProps = {
  filters: ExpenseFilters;
  expensePage: ExpensePageData;
  categories: CategoryOption[];
  partners: PartnerOption[];
};

export function ExpensesClient({
  filters,
  expensePage,
  categories,
  partners,
}: ExpensesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filterKey = JSON.stringify(filters);
  const [draftState, setDraftState] = React.useState({ key: filterKey, value: filters });
  const draft = draftState.key === filterKey ? draftState.value : filters;

  function updateDraft(updater: (current: ExpenseFilters) => ExpenseFilters) {
    setDraftState({ key: filterKey, value: updater(draft) });
  }

  function navigate(next: Partial<ExpenseFilters>) {
    const params = expenseFiltersToParams({ ...filters, ...next });
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  function submitFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ ...draft, page: 1 });
  }

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Expenses</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Warehouse spend</h1>
        </div>
        <ExpenseDialog
          categories={categories}
          partners={partners}
          trigger={
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Expense
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]" onSubmit={submitFilters}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={draft.q}
                onChange={(event) => updateDraft((current) => ({ ...current, q: event.target.value }))}
                className="pl-9"
                placeholder="Search expenses"
              />
            </div>

            <Select
              value={draft.categoryId}
              onValueChange={(value) => updateDraft((current) => ({ ...current, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={draft.paidById}
              onValueChange={(value) => updateDraft((current) => ({ ...current, paidById: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Paid by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All partners</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={draft.startDate}
              onChange={(event) => updateDraft((current) => ({ ...current, startDate: event.target.value }))}
              aria-label="Start date"
            />

            <Input
              type="date"
              value={draft.endDate}
              onChange={(event) => updateDraft((current) => ({ ...current, endDate: event.target.value }))}
              aria-label="End date"
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 lg:flex-none">
                Filter
              </Button>
              <Button type="button" variant="outline" size="icon" title="Clear filters" onClick={clearFilters}>
                <X className="size-4" />
                <span className="sr-only">Clear filters</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ExpenseTable
        expensePage={expensePage}
        filters={filters}
        categories={categories}
        partners={partners}
        onSort={(sort) => navigate({ sort, page: 1 })}
        onPageChange={(page) => navigate({ page })}
      />
    </div>
  );
}

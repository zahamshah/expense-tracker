"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseFiltersToParams } from "@/lib/query-params";
import type { CategoryOption, ExpenseFilters, PartnerOption } from "@/lib/types";

type ReportExportPanelProps = {
  categories: CategoryOption[];
  partners: PartnerOption[];
};

const initialFilters: ExpenseFilters = {
  q: "",
  categoryId: "all",
  paidById: "all",
  startDate: "",
  endDate: "",
  sort: "date-desc",
  page: 1,
};

export function ReportExportPanel({ categories, partners }: ReportExportPanelProps) {
  const [filters, setFilters] = React.useState(initialFilters);

  function hrefFor(format: "csv" | "xlsx" | "pdf") {
    const params = expenseFiltersToParams(filters);
    params.set("format", format);
    return `/api/reports/export?${params.toString()}`;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              className="pl-9"
              placeholder="Search description, notes, category, partner"
            />
          </div>

          <Select
            value={filters.categoryId}
            onValueChange={(value) => setFilters((current) => ({ ...current, categoryId: value }))}
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
            value={filters.paidById}
            onValueChange={(value) => setFilters((current) => ({ ...current, paidById: value }))}
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
            value={filters.startDate}
            onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
            aria-label="Start date"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
            aria-label="End date"
          />

          <Select
            value={filters.sort}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, sort: value as ExpenseFilters["sort"] }))
            }
          >
            <SelectTrigger className="sm:col-span-2">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="amount-desc">Highest amount</SelectItem>
              <SelectItem value="amount-asc">Lowest amount</SelectItem>
              <SelectItem value="category-asc">Category A-Z</SelectItem>
              <SelectItem value="paidBy-asc">Partner A-Z</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ExportButton href={hrefFor("csv")} icon={<FileText className="size-4" />} label="Export CSV" />
          <ExportButton
            href={hrefFor("xlsx")}
            icon={<FileSpreadsheet className="size-4" />}
            label="Export Excel"
          />
          <ExportButton href={hrefFor("pdf")} icon={<Download className="size-4" />} label="Export PDF" />
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => setFilters(initialFilters)}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button asChild variant="outline" className="h-12 w-full justify-start gap-3">
      <a href={href}>
        {icon}
        {label}
      </a>
    </Button>
  );
}

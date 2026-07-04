import { PAGE_SIZE } from "@/lib/constants";
import { expenseFilterSchema } from "@/lib/validations";
import type { ExpenseFilters } from "@/lib/types";

type SearchInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined;

export function parseExpenseSearchParams(input: SearchInput): ExpenseFilters {
  const raw: Record<string, string | undefined> = {};

  if (input instanceof URLSearchParams) {
    for (const key of input.keys()) {
      raw[key] = input.get(key) ?? undefined;
    }
  } else if (input) {
    for (const [key, value] of Object.entries(input)) {
      raw[key] = Array.isArray(value) ? value[0] : value;
    }
  }

  return expenseFilterSchema.parse(raw);
}

export function expenseFiltersToParams(filters: Partial<ExpenseFilters>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (
      value === undefined ||
      value === "" ||
      value === "all" ||
      (key === "page" && value === 1)
    ) {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

export { PAGE_SIZE };

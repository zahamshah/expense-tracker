import { z } from "zod";
import { RECEIPT_ALLOWED_TYPES, RECEIPT_MAX_BYTES } from "@/lib/constants";
import { isValidPounds } from "@/lib/money";

export const expenseFormSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Choose a date."),
  amount: z
    .string()
    .min(1, "Enter an amount.")
    .refine(isValidPounds, "Enter a valid GBP amount."),
  categoryId: z.string().min(1, "Choose a category."),
  description: z
    .string()
    .trim()
    .min(2, "Add a short description.")
    .max(160, "Keep the description under 160 characters."),
  paidById: z.string().min(1, "Choose who paid."),
  notes: z.string().max(1200, "Keep notes under 1200 characters.").optional(),
});

export const expenseClientSchema = expenseFormSchema.extend({
  receipt: z.unknown().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseClientSchema>;

export const expenseSortSchema = z.enum([
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
  "category-asc",
  "paidBy-asc",
]);

export const expenseFilterSchema = z.object({
  q: z.string().optional().default(""),
  categoryId: z.string().optional().default("all"),
  paidById: z.string().optional().default("all"),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  sort: expenseSortSchema.optional().default("date-desc"),
  page: z.coerce.number().int().positive().optional().default(1),
});

export const exportFormatSchema = z.enum(["csv", "xlsx", "pdf"]);

export function validateReceiptFile(file: File) {
  if (file.size > RECEIPT_MAX_BYTES) {
    return "Receipt must be 10 MB or smaller.";
  }

  if (!RECEIPT_ALLOWED_TYPES.includes(file.type as (typeof RECEIPT_ALLOWED_TYPES)[number])) {
    return "Receipt must be a PDF, JPEG, PNG, or WebP file.";
  }

  return null;
}

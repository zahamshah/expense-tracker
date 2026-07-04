import { describe, expect, it } from "vitest";
import { expenseFormSchema } from "@/lib/validations";

describe("expense form validation", () => {
  it("accepts a complete expense payload", () => {
    const result = expenseFormSchema.safeParse({
      date: "2026-07-03",
      amount: "42.50",
      categoryId: "category_1",
      description: "Packaging supplies",
      paidById: "partner_1",
      notes: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required values and invalid currency", () => {
    const result = expenseFormSchema.safeParse({
      date: "",
      amount: "42.505",
      categoryId: "",
      description: "",
      paidById: "",
    });

    expect(result.success).toBe(false);
  });
});

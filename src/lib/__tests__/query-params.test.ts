import { describe, expect, it } from "vitest";
import { expenseFiltersToParams, parseExpenseSearchParams } from "@/lib/query-params";

describe("expense query params", () => {
  it("parses report/table filter params with defaults", () => {
    const filters = parseExpenseSearchParams(
      new URLSearchParams("q=rent&categoryId=cat_1&paidById=all&sort=amount-desc&page=2"),
    );

    expect(filters).toEqual({
      q: "rent",
      categoryId: "cat_1",
      paidById: "all",
      startDate: "",
      endDate: "",
      sort: "amount-desc",
      page: 2,
    });
  });

  it("omits empty/default values when building export links", () => {
    const params = expenseFiltersToParams({
      q: "",
      categoryId: "all",
      paidById: "partner_1",
      startDate: "2026-07-01",
      endDate: "",
      sort: "date-desc",
      page: 1,
    });

    expect(params.toString()).toBe("paidById=partner_1&startDate=2026-07-01&sort=date-desc");
  });
});

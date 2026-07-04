import { describe, expect, it } from "vitest";
import { calculateDashboardStats, calculateReconciliation } from "@/lib/calculations";

describe("calculateReconciliation", () => {
  it("calculates partner balances and settlement suggestions", () => {
    const result = calculateReconciliation(
      [
        { id: "a", name: "Partner A", ownershipBps: 6000, paidPence: 10000 },
        { id: "b", name: "Partner B", ownershipBps: 2000, paidPence: 0 },
        { id: "c", name: "Partner C", ownershipBps: 2000, paidPence: 0 },
      ],
      10000,
    );

    expect(result.rows).toEqual([
      expect.objectContaining({ partnerName: "Partner A", expectedPence: 6000, balancePence: 4000 }),
      expect.objectContaining({ partnerName: "Partner B", expectedPence: 2000, balancePence: -2000 }),
      expect.objectContaining({ partnerName: "Partner C", expectedPence: 2000, balancePence: -2000 }),
    ]);
    expect(result.settlements).toEqual([
      { fromPartnerName: "Partner B", toPartnerName: "Partner A", amountPence: 2000 },
      { fromPartnerName: "Partner C", toPartnerName: "Partner A", amountPence: 2000 },
    ]);
  });

  it("keeps rounded expected contributions equal to total expenses", () => {
    const result = calculateReconciliation(
      [
        { id: "a", name: "Partner A", ownershipBps: 6000, paidPence: 0 },
        { id: "b", name: "Partner B", ownershipBps: 2000, paidPence: 0 },
        { id: "c", name: "Partner C", ownershipBps: 2000, paidPence: 10001 },
      ],
      10001,
    );

    expect(result.rows.reduce((sum, row) => sum + row.expectedPence, 0)).toBe(10001);
  });
});

describe("calculateDashboardStats", () => {
  it("calculates dashboard spend windows", () => {
    const stats = calculateDashboardStats(
      [
        {
          date: "2026-07-03T00:00:00.000Z",
          amountPence: 1000,
          category: { name: "Inventory", color: "#2563eb" },
        },
        {
          date: "2026-07-01T00:00:00.000Z",
          amountPence: 500,
          category: { name: "Shipping", color: "#dc2626" },
        },
        {
          date: "2026-06-01T00:00:00.000Z",
          amountPence: 250,
          category: { name: "Inventory", color: "#2563eb" },
        },
      ],
      new Date("2026-07-03T12:00:00.000Z"),
    );

    expect(stats.metrics.find((metric) => metric.label === "Total Expenses")?.valuePence).toBe(1750);
    expect(stats.metrics.find((metric) => metric.label === "Today's Spending")?.valuePence).toBe(1000);
    expect(stats.metrics.find((metric) => metric.label === "This Week")?.valuePence).toBe(1500);
    expect(stats.metrics.find((metric) => metric.label === "This Month")?.valuePence).toBe(1500);
    expect(stats.categoryBreakdown[0]).toEqual({
      name: "Inventory",
      value: 1250,
      color: "#2563eb",
    });
  });
});

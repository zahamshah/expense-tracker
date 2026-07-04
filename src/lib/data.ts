import "server-only";

import { calculateDashboardStats, calculateReconciliation } from "@/lib/calculations";
import { getCategoryOptions, getPartnerOptions, serializeExpense } from "@/lib/expenses";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const expenses = await prisma.expense.findMany({
    include: {
      category: true,
      paidBy: true,
      receipt: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return {
    stats: calculateDashboardStats(expenses),
    recentExpenses: expenses.slice(0, 6).map(serializeExpense),
  };
}

export async function getReconciliationData() {
  const [partners, expenseTotals] = await Promise.all([
    prisma.partner.findMany({
      where: {
        ownershipBps: {
          gt: 0,
        },
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        ownershipBps: true,
      },
    }),
    prisma.expense.groupBy({
      by: ["paidById"],
      _sum: {
        amountPence: true,
      },
    }),
  ]);

  const paidByPartner = new Map(
    expenseTotals.map((row) => [row.paidById, row._sum.amountPence ?? 0]),
  );
  const partnerInputs = partners.map((partner) => ({
    id: partner.id,
    name: partner.name,
    ownershipBps: partner.ownershipBps,
    paidPence: paidByPartner.get(partner.id) ?? 0,
  }));
  const totalExpensePence = partnerInputs.reduce(
    (total, partner) => total + partner.paidPence,
    0,
  );

  return {
    totalExpensePence,
    ...calculateReconciliation(partnerInputs, totalExpensePence),
  };
}

export async function getReferenceData() {
  const [categories, partners] = await Promise.all([
    getCategoryOptions(),
    getPartnerOptions(),
  ]);

  return { categories, partners };
}

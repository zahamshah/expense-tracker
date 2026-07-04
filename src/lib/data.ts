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
  const latestCheckpoint = await prisma.reconciliationCheckpoint.findFirst({
    orderBy: { settledAt: "desc" },
  });
  const reconciliationWhere = {
    ...(latestCheckpoint ? { createdAt: { gt: latestCheckpoint.settledAt } } : {}),
    paidBy: {
      ownershipBps: {
        gt: 0,
      },
    },
    category: {
      excludeFromReconciliation: false,
    },
  };
  const [partners, expenseTotals, excludedTotal] = await Promise.all([
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
      where: reconciliationWhere,
      _sum: {
        amountPence: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        ...(latestCheckpoint ? { createdAt: { gt: latestCheckpoint.settledAt } } : {}),
        OR: [
          {
            paidBy: {
              ownershipBps: 0,
            },
          },
          {
            category: {
              excludeFromReconciliation: true,
            },
          },
        ],
      },
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
    excludedExpensePence: excludedTotal._sum.amountPence ?? 0,
    latestCheckpoint: latestCheckpoint
      ? {
          id: latestCheckpoint.id,
          settledAt: latestCheckpoint.settledAt.toISOString(),
          settledTotalPence: latestCheckpoint.settledTotalPence,
          note: latestCheckpoint.note,
        }
      : null,
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

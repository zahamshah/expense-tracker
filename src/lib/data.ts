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
  const checkpoints = await prisma.reconciliationCheckpoint.findMany({
    orderBy: { settledAt: "desc" },
    take: 8,
  });
  const latestCheckpoint = checkpoints[0] ?? null;
  const reconciliationWhere = {
    ...(latestCheckpoint ? { createdAt: { gt: latestCheckpoint.settledAt } } : {}),
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
        category: {
          excludeFromReconciliation: true,
        },
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
    checkpoints: checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      settledAt: checkpoint.settledAt.toISOString(),
      settledTotalPence: checkpoint.settledTotalPence,
      note: checkpoint.note,
    })),
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

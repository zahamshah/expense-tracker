"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markReconciliationSettledAction() {
  const latestCheckpoint = await prisma.reconciliationCheckpoint.findFirst({
    orderBy: { settledAt: "desc" },
  });
  const where = {
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
  const total = await prisma.expense.aggregate({
    where,
    _sum: {
      amountPence: true,
    },
  });

  await prisma.reconciliationCheckpoint.create({
    data: {
      settledTotalPence: total._sum.amountPence ?? 0,
      note: "Balances manually settled.",
    },
  });

  revalidatePath("/reconciliation");

  return {
    ok: true,
  };
}

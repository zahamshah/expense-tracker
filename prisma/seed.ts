import { PrismaClient } from "../src/prisma-client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { CATEGORIES, PARTNERS } from "../src/lib/constants";

const fallbackUrl =
  "postgresql://postgres:postgres@localhost:5432/warehouse_expenses?schema=public";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        color: category.color,
        sortOrder: index + 1,
        excludeFromReconciliation: category.excludeFromReconciliation,
      },
      create: {
        name: category.name,
        slug: category.slug,
        color: category.color,
        sortOrder: index + 1,
        excludeFromReconciliation: category.excludeFromReconciliation,
      },
    });
  }

  for (const partner of PARTNERS) {
    const target = await ensurePartner(partner);

    for (const legacyName of partner.legacyNames) {
      const legacy = await prisma.partner.findUnique({
        where: { name: legacyName },
      });

      if (!legacy || legacy.id === target.id) continue;

      await prisma.expense.updateMany({
        where: { paidById: legacy.id },
        data: { paidById: target.id },
      });
      await prisma.partner.delete({
        where: { id: legacy.id },
      });
    }
  }

  await removeUnusedBusinessAccount();
}

async function ensurePartner(partner: (typeof PARTNERS)[number]) {
  const existing = await prisma.partner.findUnique({
    where: { name: partner.name },
  });

  if (existing) {
    return prisma.partner.update({
      where: { id: existing.id },
      data: {
        ownershipBps: partner.ownershipBps,
        sortOrder: partner.sortOrder,
      },
    });
  }

  const legacy = partner.legacyNames.length
    ? await prisma.partner.findFirst({
        where: {
          name: {
            in: [...partner.legacyNames],
          },
        },
      })
    : null;

  if (legacy) {
    return prisma.partner.update({
      where: { id: legacy.id },
      data: {
        name: partner.name,
        ownershipBps: partner.ownershipBps,
        sortOrder: partner.sortOrder,
      },
    });
  }

  return prisma.partner.create({
    data: {
      name: partner.name,
      ownershipBps: partner.ownershipBps,
      sortOrder: partner.sortOrder,
    },
  });
}

async function removeUnusedBusinessAccount() {
  const businessAccount = await prisma.partner.findUnique({
    where: { name: "Business Account" },
  });

  if (!businessAccount) return;

  const expenseCount = await prisma.expense.count({
    where: { paidById: businessAccount.id },
  });

  if (expenseCount === 0) {
    await prisma.partner.delete({
      where: { id: businessAccount.id },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });

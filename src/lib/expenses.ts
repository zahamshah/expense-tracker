import "server-only";

import type { Prisma } from "@/prisma-client/client";
import { PAGE_SIZE } from "@/lib/constants";
import { dateInputToUtcDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import type {
  CategoryOption,
  ExpenseFilters,
  ExpenseListItem,
  PartnerOption,
} from "@/lib/types";

const expenseInclude = {
  category: true,
  paidBy: true,
  receipt: true,
} satisfies Prisma.ExpenseInclude;

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
    },
  });
}

export async function getPartnerOptions(): Promise<PartnerOption[]> {
  return prisma.partner.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      ownershipBps: true,
    },
  });
}

export async function getExpensePage(filters: ExpenseFilters) {
  const where = buildExpenseWhere(filters);
  const page = Math.max(filters.page, 1);
  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: buildExpenseOrderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    expenses: expenses.map(serializeExpense),
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
}

export async function getExpenseExportRows(filters: ExpenseFilters) {
  const expenses = await prisma.expense.findMany({
    where: buildExpenseWhere({ ...filters, page: 1 }),
    include: expenseInclude,
    orderBy: buildExpenseOrderBy(filters.sort),
  });

  return expenses.map(serializeExpense);
}

export function buildExpenseWhere(filters: ExpenseFilters): Prisma.ExpenseWhereInput {
  const where: Prisma.ExpenseWhereInput = {};

  if (filters.categoryId && filters.categoryId !== "all") {
    where.categoryId = filters.categoryId;
  }

  if (filters.paidById && filters.paidById !== "all") {
    where.paidById = filters.paidById;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: dateInputToUtcDate(filters.startDate) } : {}),
      ...(filters.endDate ? { lte: dateInputToUtcDate(filters.endDate) } : {}),
    };
  }

  if (filters.q.trim()) {
    const query = filters.q.trim();

    where.OR = [
      { description: { contains: query, mode: "insensitive" } },
      { notes: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
      { paidBy: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  return where;
}

function buildExpenseOrderBy(sort: ExpenseFilters["sort"]): Prisma.ExpenseOrderByWithRelationInput[] {
  switch (sort) {
    case "date-asc":
      return [{ date: "asc" }, { createdAt: "asc" }];
    case "amount-desc":
      return [{ amountPence: "desc" }, { date: "desc" }];
    case "amount-asc":
      return [{ amountPence: "asc" }, { date: "desc" }];
    case "category-asc":
      return [{ category: { name: "asc" } }, { date: "desc" }];
    case "paidBy-asc":
      return [{ paidBy: { name: "asc" } }, { date: "desc" }];
    case "date-desc":
    default:
      return [{ date: "desc" }, { createdAt: "desc" }];
  }
}

export function serializeExpense(
  expense: Prisma.ExpenseGetPayload<{ include: typeof expenseInclude }>,
): ExpenseListItem {
  return {
    id: expense.id,
    date: expense.date.toISOString(),
    amountPence: expense.amountPence,
    description: expense.description,
    notes: expense.notes,
    category: {
      id: expense.category.id,
      name: expense.category.name,
      slug: expense.category.slug,
      color: expense.category.color,
    },
    paidBy: {
      id: expense.paidBy.id,
      name: expense.paidBy.name,
      ownershipBps: expense.paidBy.ownershipBps,
    },
    receipt: expense.receipt
      ? {
          id: expense.receipt.id,
          url: expense.receipt.url,
          pathname: expense.receipt.pathname,
          filename: expense.receipt.filename,
          contentType: expense.receipt.contentType,
          size: expense.receipt.size,
        }
      : null,
    createdAt: expense.createdAt.toISOString(),
  };
}

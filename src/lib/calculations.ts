import {
  addDaysInLondon,
  addMonthsInLondon,
  formatMonthLabel,
  monthKey,
  startOfMonthInLondon,
  startOfTodayInLondon,
  startOfTomorrowInLondon,
  startOfWeekInLondon,
} from "@/lib/dates";
import type {
  CategoryBreakdownItem,
  DashboardStats,
  MonthlySpendItem,
  ReconciliationRow,
  Settlement,
} from "@/lib/types";

type DashboardExpense = {
  date: Date | string;
  amountPence: number;
  category?: {
    name: string;
    color: string;
  };
};

type ReconciliationPartner = {
  id: string;
  name: string;
  ownershipBps: number;
  paidPence: number;
};

export function calculateDashboardStats(
  expenses: DashboardExpense[],
  now = new Date(),
): DashboardStats {
  const todayStart = startOfTodayInLondon(now);
  const tomorrowStart = startOfTomorrowInLondon(now);
  const weekStart = startOfWeekInLondon(now);
  const monthStart = startOfMonthInLondon(now);
  const last30Start = addDaysInLondon(todayStart, -29);
  const last12WeekStart = addDaysInLondon(weekStart, -77);
  const last12MonthStart = addMonthsInLondon(monthStart, -11);

  const totalPence = sumExpenses(expenses);
  const todayPence = sumExpensesBetween(expenses, todayStart, tomorrowStart);
  const weekPence = sumExpensesBetween(expenses, weekStart);
  const monthPence = sumExpensesBetween(expenses, monthStart);
  const last30Pence = sumExpensesBetween(expenses, last30Start, tomorrowStart);
  const last12WeekPence = sumExpensesBetween(expenses, last12WeekStart, tomorrowStart);
  const last12MonthPence = sumExpensesBetween(expenses, last12MonthStart, tomorrowStart);

  return {
    metrics: [
      { label: "Total Expenses", valuePence: totalPence, helper: "All time" },
      { label: "Today's Spending", valuePence: todayPence, helper: "Europe/London" },
      { label: "This Week", valuePence: weekPence, helper: "Monday to today" },
      { label: "This Month", valuePence: monthPence, helper: "Month to date" },
      {
        label: "Average Daily Spend",
        valuePence: Math.round(last30Pence / 30),
        helper: "Last 30 days",
      },
      {
        label: "Average Weekly Spend",
        valuePence: Math.round(last12WeekPence / 12),
        helper: "Last 12 weeks",
      },
      {
        label: "Average Monthly Spend",
        valuePence: Math.round(last12MonthPence / 12),
        helper: "Last 12 months",
      },
    ],
    categoryBreakdown: buildCategoryBreakdown(expenses),
    monthlySpend: buildMonthlySpend(expenses, monthStart),
  };
}

export function calculateReconciliation(
  partners: ReconciliationPartner[],
  totalExpensePence: number,
) {
  let assignedExpected = 0;

  const rows: ReconciliationRow[] = partners.map((partner, index) => {
    const isLast = index === partners.length - 1;
    const expectedPence = isLast
      ? totalExpensePence - assignedExpected
      : Math.round((totalExpensePence * partner.ownershipBps) / 10000);

    assignedExpected += expectedPence;

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      ownershipBps: partner.ownershipBps,
      paidPence: partner.paidPence,
      expectedPence,
      balancePence: partner.paidPence - expectedPence,
    };
  });

  return {
    rows,
    settlements: calculateSettlements(rows),
  };
}

function calculateSettlements(rows: ReconciliationRow[]): Settlement[] {
  const debtors = rows
    .filter((row) => row.balancePence < 0)
    .map((row) => ({ name: row.partnerName, amountPence: Math.abs(row.balancePence) }));
  const creditors = rows
    .filter((row) => row.balancePence > 0)
    .map((row) => ({ name: row.partnerName, amountPence: row.balancePence }));
  const settlements: Settlement[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountPence = Math.min(debtor.amountPence, creditor.amountPence);

    if (amountPence > 0) {
      settlements.push({
        fromPartnerName: debtor.name,
        toPartnerName: creditor.name,
        amountPence,
      });
    }

    debtor.amountPence -= amountPence;
    creditor.amountPence -= amountPence;

    if (debtor.amountPence === 0) debtorIndex += 1;
    if (creditor.amountPence === 0) creditorIndex += 1;
  }

  return settlements;
}

function buildCategoryBreakdown(expenses: DashboardExpense[]): CategoryBreakdownItem[] {
  const totals = new Map<string, CategoryBreakdownItem>();

  for (const expense of expenses) {
    const name = expense.category?.name ?? "Uncategorised";
    const color = expense.category?.color ?? "#64748b";
    const current = totals.get(name) ?? { name, value: 0, color };
    current.value += expense.amountPence;
    totals.set(name, current);
  }

  return Array.from(totals.values()).sort((a, b) => b.value - a.value);
}

function buildMonthlySpend(expenses: DashboardExpense[], currentMonthStart: Date): MonthlySpendItem[] {
  const months = Array.from({ length: 12 }, (_, index) =>
    addMonthsInLondon(currentMonthStart, index - 11),
  );
  const totals = new Map(months.map((month) => [monthKey(month), 0]));

  for (const expense of expenses) {
    const key = monthKey(expense.date);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + expense.amountPence);
    }
  }

  return months.map((month) => ({
    month: formatMonthLabel(month),
    totalPence: totals.get(monthKey(month)) ?? 0,
  }));
}

function sumExpenses(expenses: DashboardExpense[]) {
  return expenses.reduce((total, expense) => total + expense.amountPence, 0);
}

function sumExpensesBetween(expenses: DashboardExpense[], from: Date, to?: Date) {
  return expenses.reduce((total, expense) => {
    const date = new Date(expense.date);
    const afterStart = date >= from;
    const beforeEnd = to ? date < to : true;
    return afterStart && beforeEnd ? total + expense.amountPence : total;
  }, 0);
}

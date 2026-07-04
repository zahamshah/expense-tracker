export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

export type PartnerOption = {
  id: string;
  name: string;
  ownershipBps: number;
};

export type ReceiptInfo = {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
};

export type ExpenseListItem = {
  id: string;
  date: string;
  amountPence: number;
  description: string;
  notes: string | null;
  category: CategoryOption;
  paidBy: PartnerOption;
  receipt: ReceiptInfo | null;
  createdAt: string;
};

export type ExpenseFilters = {
  q: string;
  categoryId: string;
  paidById: string;
  startDate: string;
  endDate: string;
  sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "category-asc" | "paidBy-asc";
  page: number;
};

export type ExpensePageData = {
  expenses: ExpenseListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type MetricCardData = {
  label: string;
  valuePence: number;
  helper?: string;
};

export type CategoryBreakdownItem = {
  name: string;
  value: number;
  color: string;
};

export type MonthlySpendItem = {
  month: string;
  totalPence: number;
};

export type DashboardStats = {
  metrics: MetricCardData[];
  categoryBreakdown: CategoryBreakdownItem[];
  monthlySpend: MonthlySpendItem[];
};

export type ReconciliationRow = {
  partnerId: string;
  partnerName: string;
  ownershipBps: number;
  paidPence: number;
  expectedPence: number;
  balancePence: number;
};

export type Settlement = {
  fromPartnerName: string;
  toPartnerName: string;
  amountPence: number;
};

import { ExpensesClient } from "@/components/expenses/expenses-client";
import { SetupRequired } from "@/components/setup/setup-required";
import { getExpensePage } from "@/lib/expenses";
import { getReferenceData } from "@/lib/data";
import { isDatabaseSetupError } from "@/lib/db-errors";
import { parseExpenseSearchParams } from "@/lib/query-params";

export const dynamic = "force-dynamic";

type ExpensesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const filters = parseExpenseSearchParams(await searchParams);
  const [expensePage, referenceData] = await Promise.all([
    getExpensePage(filters),
    getReferenceData(),
  ]).catch((error: unknown) => {
    if (isDatabaseSetupError(error)) return [null, null] as const;
    throw error;
  });

  if (!expensePage || !referenceData) {
    return <SetupRequired />;
  }

  return (
    <ExpensesClient
      filters={filters}
      expensePage={expensePage}
      categories={referenceData.categories}
      partners={referenceData.partners}
    />
  );
}

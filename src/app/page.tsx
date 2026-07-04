import { Plus } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { SetupRequired } from "@/components/setup/setup-required";
import { Button } from "@/components/ui/button";
import { getDashboardData, getReferenceData } from "@/lib/data";
import { isDatabaseSetupError } from "@/lib/db-errors";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [dashboard, referenceData] = await Promise.all([getDashboardData(), getReferenceData()]).catch(
    (error: unknown) => {
      if (isDatabaseSetupError(error)) return [null, null] as const;
      throw error;
    },
  );

  if (!dashboard || !referenceData) {
    return <SetupRequired />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Warehouse expenses</h1>
        </div>
        <ExpenseDialog
          categories={referenceData.categories}
          partners={referenceData.partners}
          trigger={
            <Button className="gap-2">
              <Plus className="size-4" />
              Quick Add Expense
            </Button>
          }
        />
      </div>

      <MetricGrid metrics={dashboard.stats.metrics} />
      <DashboardCharts
        categoryBreakdown={dashboard.stats.categoryBreakdown}
        monthlySpend={dashboard.stats.monthlySpend}
      />
      <RecentExpenses expenses={dashboard.recentExpenses} />
    </div>
  );
}

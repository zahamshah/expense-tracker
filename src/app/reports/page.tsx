import { ReportExportPanel } from "@/components/reports/report-export-panel";
import { SetupRequired } from "@/components/setup/setup-required";
import { getReferenceData } from "@/lib/data";
import { isDatabaseSetupError } from "@/lib/db-errors";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const referenceData = await getReferenceData().catch((error: unknown) => {
    if (isDatabaseSetupError(error)) return null;
    throw error;
  });

  if (!referenceData) {
    return <SetupRequired />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Export expenses</h1>
      </div>
      <ReportExportPanel
        categories={referenceData.categories}
        partners={referenceData.partners}
      />
    </div>
  );
}

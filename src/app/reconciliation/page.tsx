import { ReconciliationView } from "@/components/reconciliation/reconciliation-view";
import { SetupRequired } from "@/components/setup/setup-required";
import { getReconciliationData } from "@/lib/data";
import { isDatabaseSetupError } from "@/lib/db-errors";

export const dynamic = "force-dynamic";

export default async function ReconciliationPage() {
  const reconciliation = await getReconciliationData().catch((error: unknown) => {
    if (isDatabaseSetupError(error)) return null;
    throw error;
  });

  if (!reconciliation) {
    return <SetupRequired />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Partner Reconciliation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Balances and settlement</h1>
      </div>
      <ReconciliationView data={reconciliation} />
    </div>
  );
}

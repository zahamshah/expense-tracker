import { SettlementButton } from "@/components/reconciliation/settlement-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatSignedMoney } from "@/lib/money";
import type { ReconciliationCheckpointInfo, ReconciliationRow, Settlement } from "@/lib/types";

type ReconciliationViewProps = {
  data: {
    totalExpensePence: number;
    excludedExpensePence: number;
    latestCheckpoint: ReconciliationCheckpointInfo | null;
    checkpoints: ReconciliationCheckpointInfo[];
    rows: ReconciliationRow[];
    settlements: Settlement[];
  };
};

export function ReconciliationView({ data }: ReconciliationViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Partner Contributions</CardTitle>
            {data.latestCheckpoint ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Showing activity since {new Date(data.latestCheckpoint.settledAt).toLocaleString("en-GB")}.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Showing all reconcilable partner-paid expenses.
              </p>
            )}
          </div>
          <SettlementButton />
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Reconciliation pool" value={formatMoney(data.totalExpensePence)} />
            <Metric label="Excluded expenses" value={formatMoney(data.excludedExpensePence)} />
            <Metric label="Partners" value={String(data.rows.length)} />
            <Metric label="Settlement items" value={String(data.settlements.length)} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.partnerId}>
                  <TableCell className="font-medium">{row.partnerName}</TableCell>
                  <TableCell>{(row.ownershipBps / 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-right">{formatMoney(row.paidPence)}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.expectedPence)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatSignedMoney(row.balancePence)}
                  </TableCell>
                  <TableCell>
                    <BalanceBadge balancePence={row.balancePence} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <CardTitle>Net Settlement</CardTitle>
        </CardHeader>
        <CardContent>
          {data.settlements.length ? (
            <div className="space-y-3">
              {data.settlements.map((settlement) => (
                <div
                  key={`${settlement.fromPartnerName}-${settlement.toPartnerName}-${settlement.amountPence}`}
                  className="rounded-lg border bg-background p-4"
                >
                  <p className="text-sm text-muted-foreground">{settlement.fromPartnerName} pays</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatMoney(settlement.amountPence)}
                  </p>
                  <p className="mt-2 text-sm font-medium">to {settlement.toPartnerName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Partners are currently balanced.
            </div>
          )}
        </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {data.checkpoints.length ? (
            <div className="divide-y rounded-lg border">
              {data.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(checkpoint.settledAt).toLocaleString("en-GB")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {checkpoint.note ?? "Balances manually settled."}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Cleared pool
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(checkpoint.settledTotalPence)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              No settlement checkpoints yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function BalanceBadge({ balancePence }: { balancePence: number }) {
  if (balancePence > 0) {
    return <Badge variant="success">Receives</Badge>;
  }

  if (balancePence < 0) {
    return <Badge variant="warning">Owes</Badge>;
  }

  return <Badge variant="outline">Balanced</Badge>;
}

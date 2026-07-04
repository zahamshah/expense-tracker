"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markReconciliationSettledAction } from "@/app/reconciliation/actions";
import { Button } from "@/components/ui/button";

export function SettlementButton() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function markSettled() {
    if (
      !window.confirm(
        "Mark all current reconciliation balances as manually settled? Future reconciliation will start from now.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      await markReconciliationSettledAction();
      router.refresh();
    });
  }

  return (
    <Button type="button" className="gap-2" onClick={markSettled} disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
      Mark Current Balances Settled
    </Button>
  );
}

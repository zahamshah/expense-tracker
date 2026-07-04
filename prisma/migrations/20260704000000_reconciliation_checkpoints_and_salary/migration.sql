ALTER TABLE "Category"
ADD COLUMN IF NOT EXISTS "excludeFromReconciliation" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "ReconciliationCheckpoint" (
    "id" TEXT NOT NULL,
    "settledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledTotalPence" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReconciliationCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReconciliationCheckpoint_settledAt_idx"
ON "ReconciliationCheckpoint"("settledAt");

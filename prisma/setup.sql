CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownershipBps" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "paidById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Receipt" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Partner_name_key" ON "Partner"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");
CREATE INDEX IF NOT EXISTS "Expense_categoryId_idx" ON "Expense"("categoryId");
CREATE INDEX IF NOT EXISTS "Expense_paidById_idx" ON "Expense"("paidById");
CREATE INDEX IF NOT EXISTS "Expense_createdAt_idx" ON "Expense"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Receipt_expenseId_key" ON "Receipt"("expenseId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Expense_categoryId_fkey'
  ) THEN
    ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Expense_paidById_fkey'
  ) THEN
    ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidById_fkey"
    FOREIGN KEY ("paidById") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Receipt_expenseId_fkey'
  ) THEN
    ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_expenseId_fkey"
    FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "Partner" ("id", "name", "ownershipBps", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('partner_a', 'aways', 6000, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('partner_b', 'zawar', 2000, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('partner_c', 'zaham', 2000, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('business_account', 'Business Account', 0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "ownershipBps" = EXCLUDED."ownershipBps",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Partner"
SET "name" = 'aways', "ownershipBps" = 6000, "sortOrder" = 1, "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Partner A'
  AND NOT EXISTS (SELECT 1 FROM "Partner" WHERE "name" = 'aways');

UPDATE "Partner"
SET "name" = 'zawar', "ownershipBps" = 2000, "sortOrder" = 2, "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Partner B'
  AND NOT EXISTS (SELECT 1 FROM "Partner" WHERE "name" = 'zawar');

UPDATE "Partner"
SET "name" = 'zaham', "ownershipBps" = 2000, "sortOrder" = 3, "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Partner C'
  AND NOT EXISTS (SELECT 1 FROM "Partner" WHERE "name" = 'zaham');

UPDATE "Expense"
SET "paidById" = (SELECT "id" FROM "Partner" WHERE "name" = 'aways' LIMIT 1)
WHERE "paidById" IN (SELECT "id" FROM "Partner" WHERE "name" = 'Partner A');

UPDATE "Expense"
SET "paidById" = (SELECT "id" FROM "Partner" WHERE "name" = 'zawar' LIMIT 1)
WHERE "paidById" IN (SELECT "id" FROM "Partner" WHERE "name" = 'Partner B');

UPDATE "Expense"
SET "paidById" = (SELECT "id" FROM "Partner" WHERE "name" = 'zaham' LIMIT 1)
WHERE "paidById" IN (SELECT "id" FROM "Partner" WHERE "name" = 'Partner C');

DELETE FROM "Partner" WHERE "name" IN ('Partner A', 'Partner B', 'Partner C');

INSERT INTO "Category" ("id", "name", "slug", "color", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('cat_inventory', 'Inventory', 'inventory', '#2563eb', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_warehouse_rent', 'Warehouse Rent', 'warehouse-rent', '#7c3aed', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_utilities', 'Utilities', 'utilities', '#0891b2', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_packaging', 'Packaging', 'packaging', '#059669', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_shipping', 'Shipping', 'shipping', '#dc2626', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_fuel', 'Fuel', 'fuel', '#ea580c', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_marketing', 'Marketing', 'marketing', '#db2777', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_equipment', 'Equipment', 'equipment', '#475569', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_repairs', 'Repairs', 'repairs', '#ca8a04', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_software', 'Software', 'software', '#4f46e5', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_office', 'Office', 'office', '#0d9488', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_food', 'Food', 'food', '#16a34a', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_returns', 'Returns', 'returns', '#be123c', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_misc', 'Misc', 'misc', '#64748b', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "color" = EXCLUDED."color",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;

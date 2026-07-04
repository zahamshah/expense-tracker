# Warehouse Expense Tracker

Production-ready internal expense tracker for a small WhatNot warehouse business. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, Prisma, PostgreSQL/Neon, Recharts, React Hook Form, Zod, and Vercel Blob.

## Features

- Dashboard metrics for total expenses, today, this week, this month, and rolling averages.
- Recent expenses, category pie chart, and 12-month line graph.
- Expense CRUD with date, amount in GBP, category, description, partner paid by, receipt upload, and notes.
- Search, filters, sorting, pagination, edit, and delete in the expense table.
- Partner reconciliation for 60% / 20% / 20% ownership with net settlement suggestions.
- Manual settlement checkpoints that reset reconciliation from the current moment.
- Salary expenses still appear in expenses/reporting but are excluded from reconciliation.
- Server-generated CSV, Excel, and PDF exports.
- Responsive UI with dark mode support.

## Requirements

- Node.js 24+
- PostgreSQL database, Neon compatible
- Vercel Blob store for receipt uploads

PowerShell on this machine blocks `npm.ps1`, so use `npm.cmd` in commands.

## Environment

Create `.env` from `.env.example`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/warehouse_expenses?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/warehouse_expenses?sslmode=require"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token"
```

Replace the placeholder values with the real connection strings from Neon. If you still see `HOST.neon.tech` in an error message, `.env` has not been filled in yet.

`DATABASE_URL` can use Neon's pooled connection string. `DIRECT_URL` should use Neon's direct connection string for migrations. The database name must match the one Neon gives you, often `neondb` unless you created `warehouse_expenses` yourself.

## Install And Run

```bash
npm.cmd install
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Open `http://localhost:3000`.

`localhost` is only for development on this computer. Deploying to Vercel gives you an HTTPS URL that can be opened from your phone.

## Useful Commands

```bash
npm.cmd run dev          # Start local app
npm.cmd run build        # Generate Prisma client and build Next.js
npm.cmd run start        # Run production build
npm.cmd run lint         # ESLint
npm.cmd run typecheck    # TypeScript
npm.cmd run test         # Vitest
npm.cmd run db:migrate   # Create/apply local migrations
npm.cmd run db:deploy    # Apply migrations in production
npm.cmd run db:seed      # Seed partners and categories
npm.cmd run db:studio    # Open Prisma Studio
```

## Database

The schema stores money as integer pence to avoid floating point errors. Payers are seeded as:

- aways: 60%
- zawar: 20%
- zaham: 20%

Categories are seeded from `src/lib/constants.ts`.

The initial SQL migration is committed at `prisma/migrations/20260703000000_init/migration.sql`.

If your local network blocks Postgres port `5432`, open Neon's SQL Editor and run
`prisma/setup.sql`. It creates the schema and seeds partners/categories without needing a local
Postgres connection.

## Vercel Deployment

1. Create a Neon PostgreSQL database.
2. Create a Vercel Blob store.
3. Push the project to GitHub.
4. Import the GitHub repository into Vercel.
5. Add these Vercel environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `BLOB_READ_WRITE_TOKEN`
6. Run production migrations from your local machine against Neon:

```bash
npm.cmd run db:deploy
npm.cmd run db:seed
```

7. Deploy or redeploy in Vercel.

The build script runs `prisma generate && next build`, so the generated Prisma client is created during deployment. After deployment, use the Vercel URL from any device, including your phone.

## Notes

- There is intentionally no authentication. Keep the deployment URL private or protect the Vercel project with organization-level controls.
- Receipt uploads require `BLOB_READ_WRITE_TOKEN`. Expenses without receipts can be saved without Blob configuration.
- Dashboard date windows use Europe/London boundaries.

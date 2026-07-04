import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackUrl =
  "postgresql://postgres:postgres@localhost:5432/warehouse_expenses?schema=public";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});

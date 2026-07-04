import { NextResponse } from "next/server";
import { buildExpenseExport } from "@/lib/exports";
import { getExpenseExportRows } from "@/lib/expenses";
import { parseExpenseSearchParams } from "@/lib/query-params";
import { exportFormatSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const formatResult = exportFormatSchema.safeParse(url.searchParams.get("format") ?? "csv");

  if (!formatResult.success) {
    return NextResponse.json({ error: "Unsupported export format." }, { status: 400 });
  }

  const filters = parseExpenseSearchParams(url.searchParams);
  const expenses = await getExpenseExportRows(filters);
  const file = await buildExpenseExport(formatResult.data, expenses);

  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

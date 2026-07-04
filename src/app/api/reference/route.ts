import { NextResponse } from "next/server";
import { getReferenceData } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getReferenceData();
  return NextResponse.json(data);
}

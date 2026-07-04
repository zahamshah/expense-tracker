import { NextResponse } from "next/server";
import { deleteReceiptBlob, uploadReceiptFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Upload a receipt file." }, { status: 400 });
  }

  try {
    const receipt = await uploadReceiptFile(file);
    return NextResponse.json(receipt);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload receipt." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("pathname");

  if (!pathname) {
    return NextResponse.json({ error: "Receipt pathname is required." }, { status: 400 });
  }

  try {
    const deleted = await deleteReceiptBlob(pathname);
    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete receipt." },
      { status: 400 },
    );
  }
}

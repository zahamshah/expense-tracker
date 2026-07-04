import "server-only";

import { del, put } from "@vercel/blob";
import { RECEIPT_MAX_BYTES } from "@/lib/constants";
import { validateReceiptFile } from "@/lib/validations";

export type UploadedReceipt = {
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
};

export async function uploadReceiptFile(file: File): Promise<UploadedReceipt> {
  const validationError = validateReceiptFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to upload receipts.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  const pathname = `receipts/${crypto.randomUUID()}-${safeName}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    filename: file.name,
    contentType: file.type,
    size: Math.min(file.size, RECEIPT_MAX_BYTES),
  };
}

export async function deleteReceiptBlob(pathname: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return false;
  }

  await del(pathname);
  return true;
}

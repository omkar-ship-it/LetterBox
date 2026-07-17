import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 10MB)" }, { status: 413 });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`letterbox/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  }

  // Local-dev fallback with no Blob store configured yet: inline as a data URL
  // so the create -> share -> view flow still works end-to-end before real
  // credentials exist. Swapped automatically once BLOB_READ_WRITE_TOKEN is set.
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  return NextResponse.json({ url: dataUrl });
}

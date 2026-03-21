import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAccess";
import { uploadToGridFs } from "@/lib/gridfs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Validate admin session (no payload needed).
  await requireAdminToken();

  const formData = await req.formData();
  const file = formData.get("file") as any;
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileId = await uploadToGridFs({
    buffer,
    filename: file.name || "upload",
    contentType: file.type || "application/octet-stream",
    metadata: { originalName: file.name },
  });

  return NextResponse.json({ fileId: String(fileId) });
}


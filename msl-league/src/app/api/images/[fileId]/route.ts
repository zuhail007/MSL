import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFsBucket, getGridFsFileDoc } from "@/lib/gridfs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const objectId = new ObjectId(fileId);

  const doc = await getGridFsFileDoc(fileId);
  if (!doc) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const bucket = await getGridFsBucket();
  const downloadStream = bucket.openDownloadStream(objectId);

  const contentType = (doc as any).contentType || "application/octet-stream";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Length", String((doc as any).length ?? ""));
  headers.set(
    "Content-Disposition",
    `inline; filename="${(doc as any).filename || "image"}"`
  );

  // Next.js can stream Node Readable streams.
  return new NextResponse(downloadStream as any, { status: 200, headers });
}


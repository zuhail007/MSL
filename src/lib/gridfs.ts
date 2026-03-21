import { ObjectId, GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { connectToDatabase } from "./mongoose";

const BUCKET_NAME = process.env.GRIDFS_BUCKET_NAME || "uploads";

let cachedBucket: GridFSBucket | null = null;

export async function getGridFsBucket() {
  await connectToDatabase();

  if (cachedBucket) return cachedBucket;
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection does not have a db handle yet.");

  cachedBucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  return cachedBucket;
}

export async function uploadToGridFs(params: {
  buffer: Buffer;
  filename: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}) {
  const bucket = await getGridFsBucket();
  const fileId = new ObjectId();

  return new Promise<ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(fileId, params.filename, {
      contentType: params.contentType || "application/octet-stream",
      metadata: params.metadata || {},
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(fileId));
    uploadStream.end(params.buffer);
  });
}

export async function getGridFsFileDoc(fileId: string) {
  const bucket = await getGridFsBucket();
  const bucketName = (bucket as any).s?.options?.bucketName || BUCKET_NAME;
  const filesCollection = mongoose.connection.db?.collection(`${bucketName}.files`);
  if (!filesCollection) throw new Error("GridFS files collection not found.");

  const doc = await filesCollection.findOne({ _id: new ObjectId(fileId) });
  return doc as
    | {
        _id: ObjectId;
        filename: string;
        length: number;
        contentType?: string;
        uploadDate?: Date;
      }
    | null;
}


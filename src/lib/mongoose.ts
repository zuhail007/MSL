import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Throw early so Render logs clearly show what to set.
  throw new Error("Missing environment variable MONGODB_URI");
}

let cached: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cached && mongoose.connection.readyState === 1) return cached;

  // Avoid creating multiple connections during hot reload/dev.
  if (mongoose.connection.readyState === 0) {
    cached = await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
      maxPoolSize: 10,
    });
  }

  return mongoose;
}


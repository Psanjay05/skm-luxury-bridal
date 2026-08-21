import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseGlobal ?? (global.mongooseGlobal = { conn: null, promise: null });

async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your environment (e.g. Vercel Environment Variables or .env.local)."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Quick 3s timeout for fallback handling
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;

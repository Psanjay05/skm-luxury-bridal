import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailedAt?: number;
}

declare global {
  var mongooseGlobal: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseGlobal ?? (global.mongooseGlobal = { conn: null, promise: null });

async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your environment."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If DB connection failed recently (within 30s), fail fast and use local JSON store immediately (<2ms)
  if (cached.lastFailedAt && Date.now() - cached.lastFailedAt < 30000) {
    throw new Error("MongoDB offline (cached retry backoff)");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1200, // Fast 1.2s timeout
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      cached.lastFailedAt = undefined;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.lastFailedAt = Date.now();
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;

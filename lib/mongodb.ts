import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Add a fallback check when assigning from global
let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!cached) {
  // Initialize cache if not already done
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) return cached.conn; // If a connection exists, reuse it

  if (!cached.promise) {
    // If no cached promise, create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  // Wait for the promise to resolve, then store the connection
  cached.conn = await cached.promise;
  return cached.conn;
}

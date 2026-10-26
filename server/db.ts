import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | undefined;

export function connectDatabase() {
  if (connection) return connection;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      "MongoDB is not configured. Set MONGODB_URI to enable TripLite accounts and persistence.",
    );
    return undefined;
  }
  connection = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .catch((error) => {
      connection = undefined;
      console.error(
        "MongoDB connection failed:",
        error instanceof Error ? error.message : error,
      );
      throw error;
    });
  return connection;
}

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

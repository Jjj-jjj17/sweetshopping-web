import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

console.log("DEBUG: Initializing Prisma with PG Adapter...");

let connectionString = `${process.env.DATABASE_URL}`;

// Special handling for Prisma Accelerate/Proxy URLs to extract the real connection string
// The 'pg' driver cannot connect to the Proxy (port 51213) directly in some modes.
try {
  const urlObj = new URL(connectionString);
  const apiKey = urlObj.searchParams.get("api_key");
  if (apiKey) {
    console.log("DEBUG: Detected Prisma Proxy URL. Extracting real connection string...");
    const jsonStr = Buffer.from(apiKey, "base64").toString("utf-8");
    const config = JSON.parse(jsonStr);
    if (config.databaseUrl) {
      connectionString = config.databaseUrl;
      console.log("DEBUG: Using real database URL:", connectionString.split("://")[0] + "://***");
    }
  }
} catch (e) {
  console.warn("DEBUG: Failed to parse/decode DATABASE_URL, using original.", e);
}

const pool = new Pool({
  connectionString,
  max: 20, // Increase pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false // Required for many cloud providers (Neon, Supabase, etc)
  }
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

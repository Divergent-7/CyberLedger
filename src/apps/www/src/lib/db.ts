import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __cyberledgerWwwPool?: Pool;
};

export function getDbPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForDb.__cyberledgerWwwPool) {
    globalForDb.__cyberledgerWwwPool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalForDb.__cyberledgerWwwPool;
}

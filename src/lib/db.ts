import { Pool } from "pg";

const url = process.env.DATABASE_URL;

// Pool initialized at module load so the connection is established before the
// first user request arrives (no cold-start lag on the first admin login).
const pool: Pool | null = url ? new Pool({ connectionString: url }) : null;
if (pool) pool.query("SELECT 1").catch(() => {});

export function getDb(): Pool | null {
  return pool;
}

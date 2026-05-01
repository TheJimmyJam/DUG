#!/usr/bin/env node
/**
 * Apply Supabase SQL migrations against a Postgres URL.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/db-migrate.mjs
 *
 * Reads every *.sql file in supabase/migrations/ in alphabetical order
 * and runs them inside individual transactions. Idempotent on re-run only
 * if your SQL is idempotent (use IF NOT EXISTS, etc.) — for a green-field
 * project, run once.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL env var is required");
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log(`Connected to ${client.host}:${client.port}/${client.database}`);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found.");
    return;
  }

  for (const file of files) {
    const fullPath = join(MIGRATIONS_DIR, file);
    const sql = await readFile(fullPath, "utf8");
    process.stdout.write(`> ${file} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("commit");
      console.log("ok");
    } catch (err) {
      await client.query("rollback").catch(() => {});
      console.log("FAILED");
      console.error(err.message);
      process.exit(1);
    }
  }

  console.log("All migrations applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => client.end());

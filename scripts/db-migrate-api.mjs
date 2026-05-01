#!/usr/bin/env node
/**
 * Apply Supabase SQL migrations via the Supabase Management API.
 * Use this when the project's DB hostname can't be reached directly
 * (e.g. IPv6-only direct conn, pooler not yet provisioned).
 *
 * Required env:
 *   SUPABASE_PAT          – account-level Personal Access Token (sbp_...)
 *   SUPABASE_PROJECT_REF  – the project's reference (the subdomain on supabase.co)
 *
 * Reads supabase/migrations/*.sql in order, posts each to
 *   POST https://api.supabase.com/v1/projects/{ref}/database/query
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

const pat = process.env.SUPABASE_PAT;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!pat || !ref) {
  console.error("ERROR: SUPABASE_PAT and SUPABASE_PROJECT_REF env vars are required");
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;

async function runSql(sql, label) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${label}: ${text}`);
  }
  return await res.json().catch(() => null);
}

async function main() {
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found.");
    return;
  }

  console.log(`Project: ${ref}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Found ${files.length} migration(s).\n`);

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`> ${file} ... `);
    try {
      await runSql(sql, file);
      console.log("ok");
    } catch (err) {
      console.log("FAILED");
      console.error(err.message);
      process.exit(1);
    }
  }

  console.log("\nAll migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

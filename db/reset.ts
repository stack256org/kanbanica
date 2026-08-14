import { existsSync } from "node:fs";
import postgres from "postgres";
import { DEV_DATABASE_URL } from "@/config/dev-database";
import { sanitizeDatabaseUrl } from "@/lib/pg-connection";

if (existsSync(".env")) {
  process.loadEnvFile();
}

const { url, ssl } = sanitizeDatabaseUrl(
  process.env.DATABASE_URL ?? DEV_DATABASE_URL
);
const sql = postgres(url, { ssl });

console.log("Dropping public and drizzle schemas...");
await sql`DROP SCHEMA public CASCADE`;
await sql`CREATE SCHEMA public`;
await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
await sql.end();
console.log("Database reset complete.");

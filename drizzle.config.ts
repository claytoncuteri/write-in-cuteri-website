// Drizzle config  -  consumed only by Replit's deploy-side migration
// tooling to validate that production tables match the declared schema
// in shared/schema.ts. Application code does not use Drizzle at runtime;
// src/lib/db.ts is the runtime source of truth (plain `pg` + JSONB).
//
// See shared/schema.ts for the rationale.

import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
} satisfies Config;

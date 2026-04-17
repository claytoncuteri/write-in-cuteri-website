// Drizzle schema file  -  DECLARATIVE ONLY, NOT USED AT RUNTIME.
//
// Why this exists:
// Replit's autoscale deploy pipeline runs drizzle-kit against the repo on
// every deploy. Without a schema file, drizzle-kit infers "expected state
// = empty database" and generates DROP TABLE migrations for every table
// it finds in production. That was causing Replit to prompt for approval
// to drop signups + quiz_records on every single deploy  -  which, if
// approved, would wipe every subscriber and quiz record.
//
// This file declares the tables exactly as they exist (created idempotently
// at runtime by ensureSchema() in src/lib/db.ts). With this file present,
// drizzle-kit diffs against it and sees "no changes needed," so the deploy
// pipeline stops proposing drops.
//
// Runtime source of truth is still src/lib/db.ts  -  this file is ONLY
// consumed by Replit's deploy-side migration tooling. Do not import from
// application code.

import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const signups = pgTable(
  "signups",
  {
    id: text("id").primaryKey(),
    tag: text("tag").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    data: jsonb("data"),
  },
  (table) => ({
    createdAtIdx: index("signups_created_at_idx").on(sql`${table.createdAt} DESC`),
    tagIdx: index("signups_tag_idx").on(table.tag),
  }),
);

export const quizRecords = pgTable(
  "quiz_records",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    data: jsonb("data"),
  },
  (table) => ({
    createdAtIdx: index("quiz_records_created_at_idx").on(sql`${table.createdAt} DESC`),
  }),
);

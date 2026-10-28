import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { hashSecret } from "./auth";

export const DATA_DIR = path.join(process.cwd(), "data");
export const DB_PATH = path.join(DATA_DIR, "yaarab.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

declare global {
  var __yaarabDb: Database.Database | undefined;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_events ON rate_events (ip, kind, created_at);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  capture_date TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pricing_entries (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  amount_paid REAL,
  comparable_price REAL,
  date TEXT NOT NULL DEFAULT '',
  receipt_image_id TEXT REFERENCES images (id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS authority_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  authority TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  reference_number TEXT NOT NULL DEFAULT '',
  response TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS review_timeline (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  screenshot_image_id TEXT REFERENCES images (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visit_records (
  section TEXT PRIMARY KEY,
  visit_date TEXT NOT NULL DEFAULT '',
  visit_time TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  amount_paid TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS corrections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  organisation TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'correction',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/**
 * Hashes the initial administrator code (from server-side env) into the DB on
 * first run only. If the env value is missing/weak, a random code is generated
 * and printed to the server console. After seeding, the env value is ignored —
 * the code can be changed from the admin dashboard.
 */
function seedAdmin(db: Database.Database): void {
  const existing = db
    .prepare("SELECT 1 FROM admin_credentials WHERE id = 1")
    .get();
  if (existing) return;

  let code = (process.env.ADMIN_INITIAL_CODE || "").trim();
  if (code.length < 6) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    console.warn(
      `[yaarab] ADMIN_INITIAL_CODE missing or too short. A random admin code was generated: ${code}\n` +
        `[yaarab] Change it after signing in (Admin → Settings) and restart the server.`
    );
  }
  db.prepare(
    "INSERT INTO admin_credentials (id, password_hash) VALUES (1, ?)"
  ).run(hashSecret(code));
}

function initDb(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seedAdmin(db);
  return db;
}

export function getDb(): Database.Database {
  if (!globalThis.__yaarabDb) {
    globalThis.__yaarabDb = initDb();
  }
  return globalThis.__yaarabDb;
}
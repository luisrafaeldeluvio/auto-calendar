import { Database } from "bun:sqlite";
import { type Event, type TimeSlot } from "../core/types";
import { Temporal } from "@js-temporal/polyfill";

export const db = new Database("events.sqlite", { create: true, strict: true });

db.query(
  `
    CREATE TABLE IF NOT EXISTS events (
      id TEXT UNIQUE PRIMARY KEY,
      type TEXT CHECK (type IN ("event", "task")) NOT NULL,
      name TEXT NOT NULL,
      notes TEXT NOT NULL,
      start TEXT, -- ISO-8601
      end TEXT, -- ISO-8601
      is_busy INTEGER CHECK (is_busy IN (0, 1)) NOT NULL,
      is_done INTEGER CHECK (is_done IN (0, 1)) NOT NULL,
      is_sortable INTEGER CHECK (is_sortable IN (0, 1)) NOT NULL,
      is_sorted INTEGER CHECK (is_sorted IN (0, 1)) NOT NULL,
      duration TEXT, -- UNIX Timestamp
      weight INTEGER CHECK (weight IN (1, 2, 3, 4)) NOT NULL,
      slotId TEXT NOT NULL,
      buffer_before TEXT, -- UNIX Timestamp 
      buffer_after TEXT, -- UNIX Timestamp
      start_date TEXT, -- ISO-8601
      due_Date TEXT -- ISO-8601
    ) STRICT;`,
).run();

db.query(
  `
    CREATE TABLE IF NOT EXISTS slots (
     id TEXT UNIQUE PRIMARY KEY,
     name TEXT NOT NULL,
     start TEXT NOT NULL,
     end TEXT NOT NULL 
    ) STRICT;
  `,
).run();

function toNullableText(
  d: Temporal.Duration | Temporal.PlainDateTime | null,
): string | null {
  return d ? d.toString() : null;
}

export const insertEvent = (e: Event) => {
  db.prepare(
    `INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    e.id,
    e.type,
    e.name,
    e.notes,
    toNullableText(e.start),
    toNullableText(e.end),
    e.isBusy,
    e.isDone,
    e.isSortable,
    e.isSorted,
    toNullableText(e.duration),
    e.weight,
    e.slotId,
    toNullableText(e.buffer.before),
    toNullableText(e.buffer.after),
    toNullableText(e.startDate),
    toNullableText(e.dueDate),
  );
  return e.id;
};

export const getEventById = (id: string) => {
  const row = db.prepare(`SELECT * FROM events WHERE id = $id LIMIT 1`);
  return row.get({ id: id }) as Event;
};

export const insertSlot = (s: TimeSlot) => {
  db.prepare(`INSERT INTO slots VALUES (?, ?, ?, ?)`).run(
    s.id,
    s.name,
    s.start.toString(),
    s.end.toString(),
  );
  return s.id;
};

export const getSlotById = (id: string) =>
  db.prepare(`SELECT * FROM events WHERE id = ? LIMIT 1`).get(id) as Event;

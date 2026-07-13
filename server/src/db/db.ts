import { Database } from "bun:sqlite";
import { type Event, type TimeSlot } from "../core/types";
import { Temporal } from "@js-temporal/polyfill";
import { createTask } from "../services/tasks";

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

interface GetEventOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  filter?: string;
}

/**
* @param opt - event query options:
*  - limit: ammount of rows to return, default is the max value.
*  - offset:
*  - orderBy: 
*  - order:
*  - filter: additional SQL query to the WHERE predicate
*/
export const getEvent = (opt: GetEventOptions) =>
  db
    .prepare(
      `SELECT * FROM slots $filter 
        ORDER BY $orderBy $order LIMIT $limit
      OFFSET $offset ROWS ONLY;`,
    )
    .all({
      filter: opt.filter ?? null,
      orderBy: opt.orderBy ?? "id",
      order: opt.order ?? "ASC",
      limit: opt.limit ?? "9223372036854775807",
      offset: opt.offset ?? 0,
    }) as TimeSlot[];

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
  db.prepare(`SELECT * FROM events WHERE id = ? LIMIT 1`).get(id) as TimeSlot;

export const getAllSlots = () =>
  db.prepare(`SELECT * FROM slots`).get() as TimeSlot;

interface GetSlotOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export const getSlot = (opt: GetSlotOptions) =>
  db
    .prepare(
      `SELECT * FROM slots
        ORDER BY $orderBy $order LIMIT $limit
      OFFSET $offset ROWS ONLY;`,
    )
    .all({
      orderBy: opt.orderBy ?? "id",
      order: opt.order ?? "ASC",
      limit: opt.limit ?? "9223372036854775807",
      offset: opt.offset ?? 0,
    }) as TimeSlot[];

// TODO:
// - [ ] create a "bulk"/"list" getter for both
// - [ ] refactor /services/time-slots
// -     refactor /client/.../components
//       - [ ] createTasks
//       - [ ] CreateTimeSlots
// - [ ] figure out ease of setup for a local host for normal user vs just a normal localhost

import { SQL } from "bun";
import { Temporal } from "@js-temporal/polyfill";

const sql = new SQL("sqlite://events.db");
await sql`
    CREATE TABLE IF NOT EXISTS events (
        id TEXT UNIQUE PRIMARY KEY,
        type TEXT CHECK (type IN ("event", "task")),
        name TEXT,
        notes TEXT,
        start TEXT, -- ISO-8601
        end TEXT, -- ISO-8601
        is_busy INTEGER CHECK (is_busy IN (0, 1)),
        is_done INTEGER CHECK (is_done IN (0, 1)),
        is_sortable INTEGER CHECK (is_sortable IN (0, 1)),
        is_sorted INTEGER CHECK (is_sorted IN (0, 1)),
        duration TEXT, -- UNIX Timestamp
        weight INTEGER CHECK (weight IN (1, 2, 3, 4)),
        slotId TEXT,
        buffer_before TEXT, -- UNIX Timestamp 
        buffer_after TEXT, -- UNIX Timestamp
        start_date TEXT, -- ISO-8601
        due_Date TEXT -- ISO-8601
    ) STRICT
`;

// const user = await sql<Event>`
// INSERT INTO events VALUES (${crypto.randomUUID()}, "task", 
// "Test Task", "", NULL, NULL, false, false, true, false, 
// ${Temporal.Duration.from({ hours: 2 }).total("seconds")}, 1, "1", NULL, NULL, 
// ${Temporal.Now.plainDateTimeISO().toString()},
// ${Temporal.Now.plainDateTimeISO().toString()})
// `;

const view = await sql`SELECT * FROM events`
console.log(view)
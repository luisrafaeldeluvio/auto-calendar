import { SQL } from "bun";

try {
  const sql = new SQL("sqlite://events.db");
  await sql`
    CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(5) CHECK (type IN ("event", "task")),
        name VARCHAR(255),
        notes VARCHAR(255),
        start DATETIME,
        end DATETIME,
        is_busy BOOLEAN,
        is_done BOOLEAN,
        is_sortable BOOLEAN,
        is_sorted BOOLEAN,
        duration TEXT,
        buffer_before TEXT,
        buffer_after TEXT,
        start_date DATETIME,
        due_Date DATETIME
    ) STRICT
`;


} catch (error) {
  console.log("ERRORRRRRRR:", error);
}

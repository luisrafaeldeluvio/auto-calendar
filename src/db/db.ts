import { Dexie, type EntityTable } from "dexie";
import type { TimeSlot, Event, Task, AutoTask } from "../engine/types";

export const db = new Dexie("AutoCalendarDB") as Dexie & {
  timeslots: EntityTable<TimeSlot, "id">;
  events: EntityTable<Event, "id">;
  tasks: EntityTable<Task, "id">;
  autoTasks: EntityTable<AutoTask, "id">;
};

db.version(1).stores({
  timeslots: "id, name",
  events: "id, name, isBusy",
  tasks: "id, name, isBusy, isDone",
  autoTasks:
    "id, name, isBusy, isDone, duration, weight, slotId, buffer, startDate, dueDate",
});

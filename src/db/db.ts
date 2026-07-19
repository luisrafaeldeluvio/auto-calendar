import { Dexie, type Table } from "dexie";
import type {  EventDbModel, TimeSlotDbModel } from "../types/types";

export const db = new Dexie("AutoCalendarDB") as Dexie & {
  timeslots: Table<TimeSlotDbModel, string>;
  events: Table<EventDbModel, string>;
};

db.version(1).stores({
  timeslots: "id, start, end",
  events: `
    id, type, start, 
    end, isBusy, isDone, 
    isSortable, isSorted,
    duration, weight, slotId, 
    buffer, startDate, dueDate
  `,
});

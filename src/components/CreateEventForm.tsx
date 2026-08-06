import { useState } from "react";
import { type CalendarEvent } from "../types/models/calendarItem";
import { addEvent } from "../db/queries/events";
import { Temporal } from "@js-temporal/polyfill";
import { sortTasks } from "../utils/sortTasks";

export const createEventFromForm = async (data: FormData) => {
  const start = Temporal.PlainDateTime.from(String(data.get("start")));
  const end = Temporal.PlainDateTime.from(String(data.get("end")));

  const event: Omit<CalendarEvent, "id"> = {
    type: "event",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    start: start,
    end: end,
    isBusy: true,
    isDone: false,
    isSortable: false,
    isSorted: false,
    duration: end.since(start),
    weight: 1,
    slotId: String(data.get("timeslots")),
    bufferBefore: Temporal.Duration.from({ hours: 0 }),
    bufferAfter: Temporal.Duration.from({ hours: 0 }),
    startDate: start,
    dueDate: end,
  };
  const eventResponse = await addEvent(event);
  if (!eventResponse.ok) {
    alert(eventResponse.error);
    return;
  }

  sortTasks();
};

export const CreateEventForm = () => {
  const [start, setStart] = useState(Temporal.Now.plainDateISO().toString());
  const [end, setEnd] = useState(Temporal.Now.plainDateISO().toString());
  return (
    <form
      action={createEventFromForm}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <label htmlFor="name">name</label>
      <input type="text" name="name" id="name" required />

      <label htmlFor="start">Start</label>
      <input
        type="datetime-local"
        name="start"
        id="start"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        required
      />
      <label htmlFor="end">End</label>
      <input
        type="datetime-local"
        name="end"
        id="end"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        required
      />

      <button type="submit">Create</button>
    </form>
  );
};

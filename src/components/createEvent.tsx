import { useRef, useState } from "react";
import { type Event } from "../types/models/calendarItem";
import { addEvent } from "../db/helpers";
import { Temporal } from "@js-temporal/polyfill";
import { sortTasks } from "../utils/sortTasks";

const createEventFromForm = async (data: FormData) => {
  const start = Temporal.PlainDateTime.from(String(data.get("start")));
  const end = Temporal.PlainDateTime.from(String(data.get("end")));

  const event: Omit<Event<Temporal.PlainDateTime>, "id"> = {
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
    startDate: null,
    dueDate: null,
  };
  const eventResponse = await addEvent(event);
  if (!eventResponse.ok) {
    alert(eventResponse.error);
    return;
  }

  sortTasks();
};

export const CreateEventButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [start, setStart] = useState(Temporal.Now.plainDateISO().toString());
  const [end, setEnd] = useState(Temporal.Now.plainDateISO().toString());

  const toggleDialog = () => {
    if (dialogRef.current) dialogRef.current.togglePopover();
  };

  return (
    <>
      <dialog ref={dialogRef} popover="manual">
        <p>this popped?</p>
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
        <button onClick={toggleDialog}>Close</button>
      </dialog>
      <button onClick={toggleDialog}>Create new task</button>
    </>
  );
};

import { useRef, useState } from "react";
import { type Weight } from "../types/common";
import {
  type CalendarTask,
  type CalendarTaskUnscheduled,
} from "../types/models/calendarItem";
import { addEvent } from "../db/queries/events";
import { Temporal } from "@js-temporal/polyfill";
import { useLiveQuery } from "dexie-react-hooks";
import { sortTasks } from "../utils/sortTasks";
import { getAllTimeSlots } from "../db/queries/slots";

const durationOptions = [
  { text: "5 minutes", duration: 5 },
  { text: "10 minutes", duration: 10 },
  { text: "15 minutes", duration: 15 },
  { text: "20 minutes", duration: 20 },
  { text: "25 minutes", duration: 25 },
  { text: "30 minutes", duration: 30 },
  { text: "35 minutes", duration: 35 },
  { text: "40 minutes", duration: 40 },
  { text: "45 minutes", duration: 45 },
  { text: "50 minutes", duration: 50 },
  { text: "55 minutes", duration: 55 },
  { text: "60 minutes", duration: 60 },
];

const weightOptions = [
  { text: "Low", weight: 0 },
  { text: "Normal", weight: 1 },
  { text: "High", weight: 2 },
  { text: "Do ASAP", weight: 3 },
];

const createTaskFromForm = async (data: FormData) => {
  const baseTask = {
    type: "task",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    isBusy: false,
    isDone: false,
    isSorted: false,
    weight: Number(data.get("weight")) as Weight,
    slotId: String(data.get("timeslots")),
    bufferBefore: Temporal.Duration.from({ hours: 0 }),
    bufferAfter: Temporal.Duration.from({ hours: 0 }),
  } as const;

  const task: Omit<CalendarTaskUnscheduled, "id"> | Omit<CalendarTask, "id"> =
    Boolean(data.get("auto-sort"))
      ? {
          ...baseTask,
          start: null,
          end: null,
          isSortable: true,
          duration: Temporal.Duration.from({
            minutes: Number(data.get("durations")),
          }),
          startDate: Temporal.PlainDateTime.from(String(data.get("startDate"))),
          dueDate: Temporal.PlainDateTime.from(String(data.get("dueDate"))),
        }
      : {
          ...baseTask,
          start: Temporal.PlainDateTime.from(String(data.get("start"))),
          end: Temporal.PlainDateTime.from(String(data.get("end"))),
          isSortable: false,
          duration: Temporal.PlainDateTime.from(String(data.get("end"))).since(
            Temporal.PlainDateTime.from(String(data.get("start"))),
          ),
          startDate: Temporal.PlainDateTime.from(String(data.get("start"))),
          dueDate: Temporal.PlainDateTime.from(String(data.get("end"))),
        };
  const eventResponse = await addEvent(task);

  if (!eventResponse.ok) {
    alert(eventResponse.error);
    return;
  }

  sortTasks();
};

const CreateTaskForm = () => {
  const slots = useLiveQuery(getAllTimeSlots);
  const [startDate, setStartDate] = useState(
    Temporal.Now.plainDateISO().toString(),
  );
  const [dueDate, setDueDate] = useState(
    Temporal.Now.plainDateISO().toString(),
  );
  const [start, setStart] = useState(Temporal.Now.plainDateISO().toString());
  const [end, setEnd] = useState(Temporal.Now.plainDateISO().toString());
  const [autoSortForm, setAutoSortForm] = useState(true);

  return (
    <form
      action={createTaskFromForm}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <label htmlFor="name">name</label>
      <input type="text" name="name" id="name" required />

      <label htmlFor="auto-sort">Auto sort?</label>
      <input
        type="checkbox"
        name="auto-sort"
        id="auto-sort"
        checked={autoSortForm}
        onChange={(e) => setAutoSortForm(e.target.checked)}
      />

      {autoSortForm ? (
        <>
          <label htmlFor="durations">duration</label>
          <select name="durations" id="durations" required>
            {durationOptions.map((e) => (
              <option value={e.duration} key={e.duration}>
                {e.text}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
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
        </>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {weightOptions.map((e) => {
          return (
            <>
              <input
                type="radio"
                name="weight"
                id={e.text}
                value={e.weight}
                key={e.weight}
                defaultChecked={e.text === "Normal" ? true : false}
                required
              />
              <label htmlFor={e.text}>{e.text}</label>
            </>
          );
        })}
      </div>

      {autoSortForm ? (
        <>
          <label htmlFor="timeslots">timeslot</label>
          <select name="timeslots" id="timeslots" required>
            {slots && slots.ok
              ? slots.data.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))
              : null}
          </select>

          <label htmlFor="startDate">Can be started on</label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <label htmlFor="dueDate">Due by</label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </>
      ) : undefined}
      <button type="submit">Create</button>
    </form>
  );
};

export const CreateTaskButton = () => {
  return (
    <>
      <dialog id="create-task-dialog" popover="">
        <CreateTaskForm />
        <button popoverTarget="create-task-dialog" popoverTargetAction="hide">
          Close
        </button>
      </dialog>
      <button popoverTarget="create-task-dialog" popoverTargetAction="show">
        Create new task
      </button>
    </>
  );
};

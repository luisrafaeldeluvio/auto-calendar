import type React from "react";
import { useId, useState } from "react";
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
import type { EventDbModel } from "../db/types";

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
const updateTaskFromForm = () => {};

type FormInputProps = {
  label: string;
  id?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = ({ label, id = useId(), ...props }: FormInputProps) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </>
  );
};

type TaskFormProps =
  | { mode: "create"; data?: undefined }
  | { mode: "edit" | "view"; data: EventDbModel };

export const TaskForm = ({ mode, data }: TaskFormProps) => {
  const isViewOnly = mode === "view";
  const slots = useLiveQuery(getAllTimeSlots);

  const [autoSortForm, setAutoSortForm] = useState(data?.isSortable ?? true);
  const [startDate, setStartDate] = useState(data?.startDate ?? Temporal.Now.plainDateISO().toString(),);
  const [dueDate, setDueDate] = useState(data?.dueDate ?? Temporal.Now.plainDateISO().toString(),);
  const [start, setStart] = useState(data?.start ?? Temporal.Now.plainDateISO().toString(),);
  const [end, setEnd] = useState(data?.end ?? Temporal.Now.plainDateISO().toString(),);

  const handleFormAction =
    mode === "create" ? createTaskFromForm :
    mode === "edit" ? updateTaskFromForm :
    undefined;

  return (
    <form action={handleFormAction} style={{ display: "flex", flexDirection: "column", }}>
      <FormInput
        label="Name"
        type="text"
        name="name"
        defaultValue={data?.name}
        disabled={isViewOnly}
        required

      />
      <FormInput
        label="Auto Sort?"
        type="checkbox"
        name="auto-sort"
        checked={autoSortForm}
        onChange={(e) => setAutoSortForm(e.target.checked)}
        disabled={isViewOnly}
      />

      {autoSortForm ? (
        <>
          <label htmlFor="durations">Duration</label>
           <select
            name="durations"
            id="durations"
            required
            disabled={isViewOnly}
            defaultValue={data ? Temporal.Duration.from(data.duration).minutes : undefined}
          >
            {durationOptions.map((e) => (
              <option value={e.duration} key={e.duration}>
                {e.text}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <FormInput
            label="Start"
            type="datetime-local"
            name="start"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            disabled={isViewOnly}
          />
          <FormInput
            label="End"
            type="datetime-local"
            name="end"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            disabled={isViewOnly}
          />
        </>
      )}

      <div style={{ display: "flex", flexDirection: "row", }}>
        {weightOptions.map((e) => {
          return (
            <FormInput
              key={e.weight}
              label={e.text}
              type="radio"
              name="weight"
              value={e.weight}
              defaultChecked={data ? data.weight === e.weight : e.text === "Normal" }
              required
              disabled={isViewOnly}
            />
          );
        })}
      </div>

      {autoSortForm && (
        <>
          <label htmlFor="timeslots">timeslot</label>
          <select
            name="timeslots"
            id="timeslots"
            required
            disabled={isViewOnly}
            defaultValue={data?.slotId}
          >
            {slots && slots.ok
              ? slots.data.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))
              : null}
          </select>

          <FormInput
            label="Can be started on"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            disabled={isViewOnly}
          />
          <FormInput
            label="Due by"
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={isViewOnly}
          />
        </>
      )}

      {isViewOnly ? undefined : (
        <button type="submit">{mode === "create" ? "Create" : "Update"}</button>
      )}
    </form>
  );
};

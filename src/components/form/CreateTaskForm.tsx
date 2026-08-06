import { useEffect, useState } from "react";
import { type Weight } from "../../types/common";
import {
  type CalendarItemType,
  type CalendarTask,
  type CalendarTaskUnscheduled,
} from "../../types/models/calendarItem";
import { addEvent } from "../../db/queries/events";
import { Temporal } from "@js-temporal/polyfill";
import { useLiveQuery } from "dexie-react-hooks";
import { sortTasks } from "../../utils/sortTasks";
import { getAllTimeSlots } from "../../db/queries/slots";
import type { EventDbModel } from "../../db/types";
import { db } from "../../db/db";
import { FormInput } from "../common/FormInput";
import { FormSelect } from "../common/FormSelect";

const durationOptions = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "25 minutes", value: 25 },
  { label: "30 minutes", value: 30 },
  { label: "35 minutes", value: 35 },
  { label: "40 minutes", value: 40 },
  { label: "45 minutes", value: 45 },
  { label: "50 minutes", value: 50 },
  { label: "55 minutes", value: 55 },
  { label: "60 minutes", value: 60 },
];

const weightOptions = [
  { text: "Low", weight: 0 },
  { text: "Normal", weight: 1 },
  { text: "High", weight: 2 },
  { text: "Do ASAP", weight: 3 },
];

export const createTaskFromForm = async (data: FormData) => {
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
export const updateTaskFromForm = async (data: FormData, id: string) => {
  const update = {
    name: String(data.get("name")),
    isSortable: data.get("isSortable") === "on",
    weight: Number(data.get("weight")) as Weight,
    ...(data.get("duration")
      ? {
          duration: Temporal.Duration.from({
            minutes: Number(data.get("duration")),
          }).toString(),
        }
      : {}),
    ...(data.get("start")
      ? {
          start: Temporal.PlainDateTime.from(
            String(data.get("start")),
          ).toString(),
        }
      : {}),
    ...(data.get("end")
      ? {
          end: Temporal.PlainDateTime.from(String(data.get("end"))).toString(),
        }
      : {}),
    ...(data.get("timeslots")
      ? {
          slotId: String(data.get("timeslots")),
        }
      : {}),
    ...(data.get("startDate")
      ? {
          startDate: Temporal.PlainDate.from(
            String(data.get("startDate")),
          ).toString(),
        }
      : {}),
    ...(data.get("dueDate")
      ? {
          dueDate: Temporal.PlainDate.from(
            String(data.get("dueDate")),
          ).toString(),
        }
      : {}),
  };
  try {
    console.log(update);
    await db.events.update(id, update);
    sortTasks();
  } catch (e) {
    console.warn(e);
  }
};

interface CalItemFormFieldsProps {
  itemType: CalendarItemType;
  data?: EventDbModel;
  isViewOnly: boolean;
}

export const CalItemFormFields = ({
  itemType,
  data,
  isViewOnly,
}: CalItemFormFieldsProps) => {
  const isEvent = itemType === "event";
  const isTask = itemType === "task";
  const slots = useLiveQuery(getAllTimeSlots);
  const dateNow = Temporal.Now.plainDateTimeISO().toString();
  const common = { required: true, disabled: isViewOnly };

  const [autoSortForm, setAutoSortForm] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | undefined>(dateNow);
  const [dueDate, setDueDate] = useState<string | undefined>(dateNow);
  const [start, setStart] = useState<string | undefined>(dateNow);
  const [end, setEnd] = useState<string | undefined>(dateNow);

  useEffect(() => {
    if (!data) return;
    setStart(data.start);
    setEnd(data.end);

    if (isEvent) return;
    setAutoSortForm(data.isSortable);
    setStartDate(data.startDate);
    setDueDate(data.dueDate);
  }, [data]);

  return (
    <>
      <FormInput
        label="Name"
        type="text"
        name="name"
        defaultValue={data?.name}
        {...common}
      />
      {isTask && (
        <FormInput
          label="Auto Sort?"
          type="checkbox"
          name="isSortable"
          checked={autoSortForm}
          onChange={(e) => setAutoSortForm(e.target.checked)}
          disabled={isViewOnly}
        />
      )}

      {isEvent || !autoSortForm ? (
        <>
          <FormInput
            label="Start"
            type="datetime-local"
            name="start"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            {...common}
          />
          <FormInput
            label="End"
            type="datetime-local"
            name="end"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            {...common}
          />
        </>
      ) : (
        <FormSelect
          label="Duration"
          name="duration"
          defaultValue={data && Temporal.Duration.from(data.duration).minutes}
          options={durationOptions}
          {...common}
        />
      )}

      {isTask && (
        <>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {weightOptions.map(({ weight, text }) => {
              return (
                <FormInput
                  key={weight}
                  label={text}
                  type="radio"
                  name="weight"
                  value={weight}
                  defaultChecked={data?.weight === weight || text === "Normal"}
                  {...common}
                />
              );
            })}
          </div>

          {autoSortForm && (
            <>
              <FormSelect
                label="Timeslots"
                name="slotId"
                defaultValue={data?.slotId}
                options={
                  (slots?.ok &&
                    slots.data.map((s) => ({ label: s.name, value: s.id }))) ||
                  []
                }
                {...common}
              />

              <FormInput
                label="Can be started on"
                type="date"
                name="startDate"
                value={startDate?.slice(0, 10)}
                onChange={(e) => setStartDate(e.target.value)}
                {...common}
              />
              <FormInput
                label="Due by"
                type="date"
                name="dueDate"
                value={dueDate?.slice(0, 10)}
                onChange={(e) => setDueDate(e.target.value)}
                {...common}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

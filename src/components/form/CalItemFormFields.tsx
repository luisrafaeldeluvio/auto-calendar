import { useEffect, useState } from "react";
import { type CalendarItemType } from "../../types/models/calendarItem";
import { Temporal } from "@js-temporal/polyfill";
import { useLiveQuery } from "dexie-react-hooks";
import { getAllTimeSlots } from "../../db/queries/slots";
import type { EventDbModel } from "../../db/types";
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

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
// should work on delete button
// should probably pass the mode to here
// so that delete would only appear in view and edit mode, not create
// or maybe i should create a delete event prop and pass it as a child of CalItemForm as well?
// yep i should do that!!!, also that for the duplicate button!!!
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

  const [name, setName] = useState<string | undefined>();
  const [duration, setDuration] = useState<number | undefined>();
  const [weight, setWeight] = useState<string | undefined>();
  const [slotId, setSlotId] = useState<string | undefined>();
  const [autoSortForm, setAutoSortForm] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | undefined>(dateNow);
  const [dueDate, setDueDate] = useState<string | undefined>(dateNow);
  const [start, setStart] = useState<string | undefined>(dateNow);
  const [end, setEnd] = useState<string | undefined>(dateNow);
  const [bufferBefore, setBufferBefore] = useState<string | undefined>();
  const [bufferAfter, setBufferAfter] = useState<string | undefined>();

  useEffect(() => {
    console.log(data);
    if (!data) return;
    setName(data.name);
    setWeight(String(data.weight));
    setStart(data.start);
    setEnd(data.end);
    setBufferBefore(data.bufferBefore);
    setBufferAfter(data.bufferAfter);

    if (isEvent) return;
    setDuration(Temporal.Duration.from(data.duration).minutes);
    setSlotId(data.slotId);
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
        value={name}
        onChange={(e) => setName(e.target.value)}
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
          value={duration}
          onChange={(e) =>
            setDuration(
              Temporal.Duration.from({ minutes: Number(e.target.value) })
                .minutes,
            )
          }
          options={durationOptions}
          {...common}
        />
      )}
      {isTask && (
        <>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {weightOptions.map((w) => {
              return (
                <FormInput
                  key={w.weight}
                  label={w.text}
                  type="radio"
                  name="weight"
                  value={w.weight}
                  defaultChecked={
                    weight === String(w.weight) || w.text === "Normal"
                  }
                  onChange={(e) => setWeight(e.target.value)}
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
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
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
      // buffer after are set to 15 minutes by default for me
      <div style={{ display: "flex", flexDirection: "row" }}>
        <FormInput
          label={"Buffer Before"}
          type="number"
          min="0"
          max="1440"
          name="bufferBefore"
          value={
            bufferBefore ? Temporal.Duration.from(bufferBefore).minutes : 0
          }
          onChange={(e) => setBufferBefore(e.target.value)}
          {...common}
        />
        <FormInput
          label={"Buffer After"}
          type="number"
          min="0"
          max="1440"
          name="bufferAfter"
          value={bufferAfter ? Temporal.Duration.from(bufferAfter).minutes : 15}
          onChange={(e) => setBufferAfter(e.target.value)}
          {...common}
        />
      </div>
    </>
  );
};

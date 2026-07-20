import { useEffect, useRef, useState } from "react";

import {
  type TimeSlot,
  type TimeSlotDbModel,
  type Weight,
  type Event
} from "../types/types";
import { addEvent, getAllTimeSlots } from "../db/helpers";
import { Temporal } from "@js-temporal/polyfill";

const durationOptions = [
  {
    text: "5 minutes",
    duration: 5,
  },
  {
    text: "10 minutes",
    duration: 10,
  },
  {
    text: "15 minutes",
    duration: 15,
  },
  {
    text: "20 minutes",
    duration: 20,
  },
  {
    text: "25 minutes",
    duration: 25,
  },
  {
    text: "30 minutes",
    duration: 30,
  },
  {
    text: "35 minutes",
    duration: 35,
  },
  {
    text: "40 minutes",
    duration: 40,
  },
  {
    text: "45 minutes",
    duration: 45,
  },
  {
    text: "50 minutes",
    duration: 50,
  },
  {
    text: "55 minutes",
    duration: 55,
  },
  {
    text: "60 minutes",
    duration: 60,
  },
];

const weightOptions = [
  {
    text: "Low",
    weight: 0,
  },
  {
    text: "Normal",
    weight: 1,
  },
  {
    text: "High",
    weight: 2,
  },
  {
    text: "Do ASAP",
    weight: 3,
  },
];

const createTaskFromForm = async (data: FormData) => {
  const task:Omit<Event<null>, "id"> = {
    type: "task",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    isSorted: false,
    duration: Temporal.Duration.from({minutes: Number(data.get("durations"))}),
    weight: Number(data.get("weight")) as Weight,
    slotId: String(data.get("timeslots")),

    bufferBefore: Temporal.Duration.from({ hours: 0 }),
    bufferAfter: Temporal.Duration.from({ hours: 0 }),
    startDate: Temporal.PlainDateTime.from(String(data.get("startDate"))),
    dueDate: Temporal.PlainDateTime.from(String(data.get("dueDate"))),
  };
  const x = await addEvent(task)

  if(!x.ok) alert(x.error)
};
export const CreateTaskButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [slots, setSlots] = useState<TimeSlotDbModel[]>([]);

  useEffect(() => {
    async function fn() {
      const s = await getAllTimeSlots();
      if (!s.ok) {
        alert(s.error);
        return;
      }
      setSlots(s.data);
    }

    fn();
  }, []);

  const toggleDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.togglePopover();
    }
  };

  return (
    <>
      <dialog ref={dialogRef} popover="manual">
        <p>this popped?</p>
        <form
          action={createTaskFromForm}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label htmlFor="name">name</label>
          <input type="text" name="name" id="name" required />

          <label htmlFor="durations">duration</label>
          <select name="durations" id="durations" required>
            {durationOptions.map((e) => (
              <option value={e.duration} key={e.duration}>
                {e.text}
              </option>
            ))}
          </select>

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

          <label htmlFor="timeslots">timeslot</label>
          <select name="timeslots" id="timeslots" required>
            {slots?.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label htmlFor="startDate">Can be started on</label>
          <input type="date" name="startDate" id="startDate" required />
          <label htmlFor="dueDate">Due by</label>
          <input type="date" name="dueDate" id="dueDate" required />

          <button type="submit">Create</button>
        </form>
        <button onClick={toggleDialog}>Close</button>
      </dialog>
      <button onClick={toggleDialog}>Create new task</button>
    </>
  );
};

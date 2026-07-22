import { useEffect, useRef, useState } from "react";
import { type TimeSlotDbModel, type Weight, type Event } from "../types/types";
import { addEvent, getAllTimeSlots } from "../db/helpers";
import { Temporal } from "@js-temporal/polyfill";
import { agenda } from "../core/agenda";
import { db } from "../db/db";
import {
  fromEventDbModel,
  fromTimeSlotDbModel,
} from "../db/serializeDataObject";

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
  const task: Omit<Event<null>, "id"> = {
    type: "task",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    isSorted: false,
    duration: Temporal.Duration.from({
      minutes: Number(data.get("durations")),
    }),
    weight: Number(data.get("weight")) as Weight,
    slotId: String(data.get("timeslots")),

    bufferBefore: Temporal.Duration.from({ hours: 0 }),
    bufferAfter: Temporal.Duration.from({ hours: 0 }),
    startDate: Temporal.PlainDateTime.from(String(data.get("startDate"))),
    dueDate: Temporal.PlainDateTime.from(String(data.get("dueDate"))),
  };
  const x = await addEvent(task);

  if (!x.ok) alert(x.error);
  sortTasks();
};
const sortTasks = async () => {
  const toSort = await db.events
    .filter((e) => e.isSortable && !e.isSorted)
    .toArray()
    .then((arr) => arr.map((e) => fromEventDbModel(e) as Event<null>));

  const busyEvents = await db.events
    .where({ isBusy: "true" })
    .toArray()
    .then((arr) =>
      arr.map((e) => fromEventDbModel(e) as Event<Temporal.PlainDateTime>),
    );

  const slots = await getAllTimeSlots().then((r) =>
    r.ok ? r.data.map((s) => fromTimeSlotDbModel(s)) : [],
  );

  const ag = agenda(
    Temporal.PlainDate.from({ month: 7, day: 19, year: 2026 }),
    Temporal.PlainDate.from({ month: 7, day: 26, year: 2026 }),
    toSort ?? [],
    busyEvents ?? [],
    slots,
  );

  const toUpdate = ag.sortedTasks.map((e) => {
    return {
      key: e.id,
      changes: {
        start: e.start.toString(),
        end: e.start.toString(),
        isBusy: e.isBusy,
        isSorted: e.isSortable,
      },
    };
  });

  try {
    db.events.bulkUpdate(toUpdate);
  } catch (e) {
    console.log("on update", e);
  }
};
// - [ ] I think theres something wrong in agenda? I should run the tests.
// - Yep something is wrong, I got the same DateTime for both start and end.
// - [ ] need to use the LiveQuery thing since when creating a new slot, its not
// getting updated on react, resulting in needint to relaod.
// - [x]  add startBy and dueBy default of today on the form.
// - [x] TODO: make it now sort them (via agenda) when adding new tasks.
// - Maybe a new sort button?
export const CreateTaskButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [slots, setSlots] = useState<TimeSlotDbModel[]>([]);
  const [startDate, setStartDate] = useState(
    Temporal.Now.plainDateISO().toString(),
  );
  const [dueDate, setDueDate] = useState(
    Temporal.Now.plainDateISO().toString(),
  );

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

          <button type="submit">Create</button>
        </form>
        <button onClick={toggleDialog}>Close</button>
      </dialog>
      <button onClick={toggleDialog}>Create new task</button>
    </>
  );
};

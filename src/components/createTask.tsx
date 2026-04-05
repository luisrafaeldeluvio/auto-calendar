import { useRef } from "react";
import { addAutoTask, getAllTimeSlot } from "../db/helpers";
import { type TimeSlot, type Weight } from "../engine/types";
import { createAutoTask } from "../engine/tasks";
import { getTime } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";

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

const createTaskFromForm = (data: FormData) => {
  const task = createAutoTask({
    name: String(data.get("name")),
    notes: String(data.get("notes") ?? ""),

    isBusy: true,

    duration: Number(data.get("durations")),
    weight: Number(data.get("weight")) as Weight,
    slotId: String(data.get("timeslots")),

    buffer: {
      before: 0,
      after: 0,
    },

    startDate: getTime(String(data.get("startDate"))),
    dueDate: getTime(String(data.get("dueDate"))),
  });

  if (task.ok) {
    console.log(task.data);
    addAutoTask(task.data);
  } else {
    console.error(task.error);
  }
};

export const CreateTaskButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const slots: TimeSlot[] | undefined = useLiveQuery(() => getAllTimeSlot());

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
            {durationOptions.map((e) => {
              return (
                <option value={e.duration} key={e.duration}>
                  {e.text}
                </option>
              );
            })}
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
            {slots?.map((s) => {
              return (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              );
            })}
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

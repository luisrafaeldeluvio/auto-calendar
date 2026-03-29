import { useRef } from "react";
import { addSlot } from "../engine/time-slots";
import { addTimeSlot } from "../db/helpers";

const createTimeslotFromForm = (data: FormData) => {
  const slot = addSlot([], {
    name: String(data.get("name")),
    start: Number(data.get("start")),
    end: Number(data.get("end")),
  });

  console.log(slot);

  if (slot.ok) {
    addTimeSlot(slot.data.slot);
    console.log("success creating timeslot: ", slot.data.slot);
  } else {
    console.log("error creating timeslot: ", slot.error);
  }
};

export const CreateTimeslotButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggleDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.togglePopover();
    }
  };

  return (
    <>
      <dialog ref={dialogRef} popover="manual">
        <p>this popped?</p>
        <form action={createTimeslotFromForm}>
          <input type="text" name="name" />

          <input type="number" name="start" min="0" max="1440" />
          <input type="number" name="end" min="0" max="1440" />
          <button type="submit">Create</button>
        </form>
        <button onClick={toggleDialog}>Close</button>
      </dialog>
      <button onClick={toggleDialog}>Create new time slot</button>
    </>
  );
};

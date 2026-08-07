import { db } from "../../db/db";
import type { EventDbModel } from "../../db/types";

export const CustomEvent = ({
  event,
  ref,
}: {
  event: EventDbModel;
  ref: React.RefObject<HTMLDialogElement | null>;
}) => {
  const finishTask = async (state: boolean) =>
    await db.events.update(event.id, {
      isDone: state,
    });

  return (
    <>
      <button
        style={{ backgroundColor: "red", width: "100%", height: "100%" }}
        onClick={() => ref.current?.showModal()}
      >
        <input
          type="checkbox"
          name="isDone"
          id={event.id}
          onClick={(e) => e.stopPropagation()}
          checked={event.isDone}
          onChange={(e) => finishTask(e.target.checked)}
        />
        <span>{event.isDone ? <s>{event.name}</s> : event.name}</span>
      </button>
    </>
  );
};
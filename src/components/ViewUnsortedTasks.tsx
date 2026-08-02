import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { CustomEvent } from "../App";

export const UnsortedTaskModal = () => {
  const items = useLiveQuery(() =>
    db.events.filter((i) => i.isSortable && !i.isSorted).toArray(),
  );
  return (
    <dialog id="unsorted-tasks-dialog" popover="">
      <li>
        {items
          ? items.map((i) => (
              <ul>
                <CustomEvent event={i} />
              </ul>
            ))
          : undefined}
      </li>
    </dialog>
  );
};

export const ViewUnsortedTasksButton = () => {
  return (
    <>
      <UnsortedTaskModal></UnsortedTaskModal>
      <button popoverTarget="unsorted-tasks-dialog" popoverTargetAction="show">
        View Unsorted Tasks
      </button>
    </>
  );
};

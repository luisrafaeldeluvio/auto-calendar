import { useEffect, useState } from "react";
import type { CalendarItemType } from "../types/models/calendarItem";
import { CalItemForm } from "./form/CalItemForm";
import { CalItemFormFields,  } from "./form/CalItemFormFields";
import { createEventFromForm } from "./form/eventFromForm";
import { createTaskFromForm } from "./form/taskFromForm";

interface CreateCalendarItemButtonProp {
  defaultItemType: CalendarItemType;
}

export const CreateCalendarItemButton = ({
  defaultItemType,
}: CreateCalendarItemButtonProp) => {
  const [itemType, setItemType] = useState<CalendarItemType>(defaultItemType);
  useEffect(() => console.log(itemType), [itemType]);
  return (
    <>
      <dialog id="create-calendar-item-dialog" popover="">
        <label htmlFor="item-type-event">Event</label>
        <input
          type="radio"
          name="item-type"
          id="item-type-event"
          value={"event"}
          checked={itemType === "event"}
          onChange={(e) => setItemType(e.target.value as CalendarItemType)}
          required
        />

        <label htmlFor="item-type-task">Task</label>
        <input
          type="radio"
          name="item-type"
          id="item-type-task"
          value={"task"}
          checked={itemType === "task"}
          onChange={(e) => setItemType(e.target.value as "event" | "task")}
          required
        />

        {itemType === "task" ? (
          <CalItemForm
            mode="create"
            createFormAction={(formData) => createTaskFromForm(formData)}
          >
            <CalItemFormFields isViewOnly={false} itemType={"task"} />
          </CalItemForm>
        ) : (
          <CalItemForm
            mode="create"
            createFormAction={(formData) => createEventFromForm(formData)}
          >
            <CalItemFormFields isViewOnly={false} itemType={"event"} />
          </CalItemForm>
        )}

        <button
          popoverTarget="create-calendar-item-dialog"
          popoverTargetAction="hide"
        >
          Close
        </button>
      </dialog>

      <button
        popoverTarget="create-calendar-item-dialog"
        popoverTargetAction="show"
      >
        Create new calendar-item
      </button>
    </>
  );
};

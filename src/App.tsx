import { useCallback, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Temporal } from "@js-temporal/polyfill";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { getWeekBounds } from "./utils/getWeekBounds";
import type { EventDbModel } from "./db/types";
import { ViewUnsortedTasksButton } from "./components/ViewUnsortedTasks";
import { CreateCalendarItemButton } from "./components/CreateCalendarItem";
import { SortTasksButton } from "./components/SortTasksButton";
import { CalItemFormFields } from "./components/form/CalItemFormFields";
import { CalItemForm } from "./components/form/CalItemForm";
import { updateTaskFromForm } from "./components/form/taskFromForm";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/*
  - [x] button for creating events
  - [x] pop up modal that shows unsorted tasks
  - [x] buttons for calendar navigation
  - [x] make tasks actually completable
    - [ ] BUG: events also have the checkboxes for completables
  - [ ] custom event colors
  - [ ] implement the buffer feature
  - [x] make calendar items clickable, allowing for editing
    - it will be basically using the create new task/event modal
    - I should first create a combine version of them (task and event)
    - [x] radio toggle to switch between task and event.
      - maybe i can just merge the two forms and then run a different function 
        depending on the radio state
    - [x] on event, create a checkbox for auto sorting a task or manually
      setting start and end
  - [ ] BUG: events also have complete tasks buttons in their component
  - [ ] when completing a task early, they should be moved to the curren time
    - (with end being the current time)
  - [ ] make calendar item duplicatable
  - [ ] allow the dialogs to be closable when clicking outside the dialog
  - [ ] allow items to de deletable
  - [ ] implement the update event forms function
  - [ ] find out how repeating calendar items would work.
    - maybe we give items a recuranceId that is shared for the repeating items.
    - then an order so we know which comes first (for when we need to edit them, so only)
      upcoming items are updated not the previous items. though I guess we can just rely on
      start property on that.
    - Use RFC 5545
  - [ ] possible new bug, task with due date of 08/03 was scheduled on 08/04
*/

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

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventData, setEventData] = useState<EventDbModel | null>(null);
  const calItemModalRef = useRef<HTMLDialogElement>(null);
  const { startOfWeek, endOfWeek } = getWeekBounds(
    Temporal.PlainDate.from({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    }),
  );

  const events = useLiveQuery(() =>
    db.events
      .filter((e) =>
        e.start
          ? e.start >= startOfWeek.toString() && e.start <= endOfWeek.toString()
          : false,
      )
      .toArray(),
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  return (
    <>
      <CreateCalendarItemButton defaultItemType={"event"} />
      <CreateTimeslotButton></CreateTimeslotButton>
      <ViewUnsortedTasksButton></ViewUnsortedTasksButton>
      <SortTasksButton />

      <dialog id={eventData?.id} ref={calItemModalRef}>
        {eventData && (
          // <TaskForm
          //   mode="edit"
          //   data={eventData}
          //   key={JSON.stringify(eventData)}
          //   onOk={() => calItemModalRef.current?.close()}
          // />

          <CalItemForm
            mode="edit"
            data={eventData}
            updateFormAction={(formData, calItem) =>
              updateTaskFromForm(formData, calItem.id)
            }
          >
            <CalItemFormFields
              data={eventData}
              isViewOnly={false}
              itemType={eventData.type}
            />
          </CalItemForm>
        )}
      </dialog>

      <Calendar
        events={events ? events : undefined}
        defaultView={Views.WEEK}
        timeslots={3}
        step={5}
        localizer={localizer}
        startAccessor={(event: EventDbModel) => new Date(event.start)}
        endAccessor={(event: EventDbModel) => new Date(event.end)}
        date={currentDate}
        onNavigate={handleNavigate}
        components={{
          week: {
            event: (e) => <CustomEvent event={e.event} ref={calItemModalRef} />,
          },
        }}
        formats={{ eventTimeRangeFormat: () => "" }}
        onSelectEvent={(f) => setEventData(f)}
      />
    </>
  );
}

export default App;

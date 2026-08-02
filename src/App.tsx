import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Temporal } from "@js-temporal/polyfill";
import { CreateTaskButton } from "./components/createTask";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { getWeekBounds } from "./utils/getWeekBounds";
import { CreateEventButton } from "./components/createEvent";
import type { EventDbModel } from "./db/types";

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
  - [ ] pop up modal that shows unsorted tasks
  - [x] buttons for calendar navigation
  - [x] make tasks actually completable
  - [ ] add a sort button for sortTask
  - [ ] custom event colors
  - [ ] implement the buffer feature
  - [x] I think i should focus on improving the code first, its becoming hard to understand.
*/

const CustomEvent = ({ event }: { event: EventDbModel }) => {
  const finishTask = async (state: boolean) =>
    await db.events.update(event.id, {
      isDone: state,
    });

  return (
    <>
      <input
        type="checkbox"
        name="isDone"
        id={event.id}
        onClick={(e) => e.stopPropagation()}
        checked={event.isDone}
        onChange={(e) => finishTask(e.target.checked)}
      />
      <span>{event.isDone ? <s>{event.name}</s> : event.name}</span>
    </>
  );
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
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
      <CreateTaskButton></CreateTaskButton>
      <CreateEventButton></CreateEventButton>
      <CreateTimeslotButton></CreateTimeslotButton>
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
        components={{ week: { event: CustomEvent } }}
        formats={{ eventTimeRangeFormat: () => "" }}
        onSelectEvent={(f) => alert(f.name)}
      />
    </>
  );
}

export default App;

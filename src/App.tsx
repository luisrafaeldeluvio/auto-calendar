import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { agenda } from "./core/agenda";
const locales = { "en-US": enUS };

import { CreateTaskButton } from "./components/createTask";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useState } from "react";
import type { Event, TimeSlot } from "./types/types";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// const mockSlot: TimeSlot[] = [
//   {
//     id: "1",
//     name: "whole day",
//     start: Temporal.PlainTime.from({ hour: 0 }),
//     end: Temporal.PlainTime.from({ hour: 3 }),
//   },
//   {
//     id: "2",
//     name: "whole day",
//     start: Temporal.PlainTime.from({ hour: 2 }),
//     end: Temporal.PlainTime.from({ hour: 4 }),
//   },
// ];

// const mockTask: Event[] = [
//   {
//     id: "1",
//     name: "Chores",
//     start: null,
//     end: null,
//     isBusy: true,
//     isDone: false,
//     isSortable: true,
//     duration: Temporal.Duration.from({ hours: 2 }),
//     weight: 2,
//     slotId: "1",
//     buffer: { before: null, after: null },
//     startDate: Temporal.Now.plainDateTimeISO(),
//     dueDate: Temporal.Now.plainDateTimeISO(),
//     type: "task",
//     notes: "",
//     isSorted: false,
//   },
//   {
//     id: "2",
//     name: "Studying",
//     start: null,
//     end: null,
//     isBusy: true,
//     isDone: false,
//     isSortable: true,
//     duration: Temporal.Duration.from({ hours: 1 }),
//     weight: 3,
//     slotId: "1",
//     buffer: { before: null, after: null },
//     startDate: Temporal.Now.plainDateTimeISO(),
//     dueDate: Temporal.Now.plainDateTimeISO(),
//     type: "task",
//     notes: "",
//     isSorted: false,
//   },
//   {
//     id: "3",
//     name: "School",
//     start: null,
//     end: null,
//     isBusy: true,
//     isDone: false,
//     isSortable: true,
//     duration: Temporal.Duration.from({ hours: 2 }),
//     weight: 1,
//     slotId: "2",
//     buffer: { before: null, after: null },
//     startDate: Temporal.Now.plainDateTimeISO().add({ days: 1 }),
//     dueDate: Temporal.Now.plainDateTimeISO().add({ days: 1 }),
//     type: "task",
//     notes: "",
//     isSorted: false,
//   },
// ];

// const data = agenda(
//   Temporal.Now.plainDateISO(),
//   Temporal.Now.plainDateISO().add({ days: 6 }),
//   mockTask,
//   mockSlot,
// );

// console.log(data);

// const processedDate = data.ok
//   ? data.data.sortedTasks.map((t) => {
//       console.log(t.name);
//       return {
//         title: t.name,
//         start: new Date(t.start.toString()),
//         end: new Date(t.end.toString()),
//       };
//     })
//   : [];

// console.log(processedDate);
/*
- [ ] maybe we should add a function that gets all the events in 1 week and display them here.
- [ ] to do that, i need to create something for managing the agenda's range.
*/

function App() {
  const baseDate = Temporal.Now.plainDateISO().toPlainDateTime({
    hour: 0,
    minute: 0,
  });
  const start = baseDate.subtract({ days: baseDate.dayOfWeek - 1 });
  const end = baseDate.add({
    days: 7 - baseDate.dayOfWeek,
    hours: 23,
    minutes: 59,
  });
  const [date, setDate] = useState<Date>(
    new Date(Temporal.Now.plainDateISO().add({ days: 1 }).toString()),
  );
  const events = useLiveQuery(() =>
    db.events.filter((e) =>
      e.start
        ? e.start >= start.toString() && e.start <= end.toString()
        : false,
    ).toArray()
  );
  return (
    <>
      <div>
        <CreateTaskButton></CreateTaskButton>
        <CreateTimeslotButton></CreateTimeslotButton>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={events ? events?.map((e) => ({
              title: e.name,
              start: new Date(e.start!),
              end: new Date(e.end!)
            })) : undefined}
            defaultView={Views.WEEK}
            timeslots={3}
            step={5}
            localizer={localizer}
            date={date}
            // onNavigate={}
            style={{ height: 700 }}
            eventPropGetter={(event, start, end, isSelected) => {
              let newStyle = {
                color: "black",
                borderRadius: "20px",
                border: "none",
                height: "100px",
                backgroundColor: "green",
              };

              return {
                className: "",
                style: newStyle,
              };
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;

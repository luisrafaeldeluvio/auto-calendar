import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { agenda } from "../../server/src/scheduler/agenda";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useState } from "react";
import type { Event, TimeSlot } from "../../server/src/core/types";
import { Temporal } from "@js-temporal/polyfill";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const mockSlot: TimeSlot[] = [
  {
    id: "1",
    name: "whole day",
    start: Temporal.PlainTime.from({ hour: 0 }),
    end: Temporal.PlainTime.from({ hour: 3 }),
  },
  {
    id: "2",
    name: "whole day",
    start: Temporal.PlainTime.from({ hour: 2 }),
    end: Temporal.PlainTime.from({ hour: 4 }),
  },
];

const mockTask: Event[] = [
  {
    id: "1",
    name: "Chores",
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: Temporal.Duration.from({ hours: 2 }),
    weight: 2,
    slotId: "1",
    buffer: { before: null, after: null },
    startDate: Temporal.Now.plainDateTimeISO(),
    dueDate: Temporal.Now.plainDateTimeISO(),
    type: "task",
    notes: "",
    isSorted: false,
  },
  {
    id: "2",
    name: "Studying",
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: Temporal.Duration.from({ hours: 1 }),
    weight: 3,
    slotId: "1",
    buffer: { before: null, after: null },
    startDate: Temporal.Now.plainDateTimeISO(),
    dueDate: Temporal.Now.plainDateTimeISO(),
    type: "task",
    notes: "",
    isSorted: false,
  },
  {
    id: "3",
    name: "School",
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: Temporal.Duration.from({ hours: 2 }),
    weight: 1,
    slotId: "2",
    buffer: { before: null, after: null },
    startDate: Temporal.Now.plainDateTimeISO().add({ days: 1 }),
    dueDate: Temporal.Now.plainDateTimeISO().add({ days: 1 }),
    type: "task",
    notes: "",
    isSorted: false,
  },
];

const data = agenda(
  Temporal.Now.plainDateISO(),
  Temporal.Now.plainDateISO().add({ days: 6 }),
  mockTask,
  mockSlot,
);

console.log(data);

const processedDate = data.ok
  ? data.data.sortedTasks.map((t) => {
      console.log(t.name);
      return {
        title: t.name,
        start: new Date(t.start.toString()),
        end: new Date(t.end.toString()),
      };
    })
  : [];

console.log(processedDate);

function App() {
  const [date, setDate] = useState<Date>(
    new Date(Temporal.Now.plainDateISO().add({ days: 1 }).toString()),
  );

  return (
    <>
      <div>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={processedDate}
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

import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay, addDays } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { agenda } from "../../server/src/scheduler/agenda";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useState } from "react";
import type { Task } from "../../server/src/core/types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const mockSlot = [
  {
    id: "1",
    name: "whole day",
    start: 0,
    end: 180,
  },
  {
    id: "2",
    name: "whole day",
    start: 120,
    end: 240,
  },
];

const mockTask: Task[] = [
  {
    id: "1",
    name: "Chores",
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: 120,
    weight: 2,
    slotId: "1",
    buffer: { before: 0, after: 0 },
    startDate: new Date().getTime(),
    dueDate: new Date().getTime(),
  },
  {
    id: "2",
    name: "Studying",
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: 60,
    weight: 3,
    slotId: "1",
    buffer: { before: 0, after: 0 },
    startDate: new Date().getTime(),
    dueDate: new Date().getTime(),
  },
  {
    id: "3",
    name: "School",
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: 60,
    weight: 1,
    slotId: "2",
    buffer: { before: 0, after: 0 },
    startDate: addDays(new Date(), 1).getTime(),
    dueDate: addDays(new Date(), 1).getTime(),
  },
];

const data = agenda(
  new Date().getTime(),
  addDays(new Date(), 6).getTime(),
  mockTask,
  mockSlot,
);

console.log(data);

const processedDate = data.sortedTasks.map((t) => {
  return {
    title: t.name,
    start: new Date(t.start),
    end: new Date(t.end),
  };
});

function App() {
  const [date, setDate] = useState<Date>(new Date());

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

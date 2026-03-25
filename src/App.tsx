import { mockEvents, tasks } from "./engine/mock-data";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
const locales = { "en-US": enUS };

import "./engine/agenda";

import "react-big-calendar/lib/css/react-big-calendar.css";
import type { AutoTask } from "./engine/types";
import { scheduledScheduleWindow } from "./engine/agenda";
import { addMinutes } from "date-fns/fp";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const formatTasks = (
  agenda: Record<
    number,
    {
      tasks: AutoTask[];
      queue: AutoTask[];
    }
  >,
) => {
  const formattedTask = Object.entries(agenda).flatMap(([day, { tasks }]) => {
    const x = tasks.map((t) => {
      return {
        ...t,
        start: addMinutes(t.start!, new Date(Number(day))),
        end: addMinutes(t.end!, new Date(Number(day))),
        title: t.name,
      };
    });

    return x;
  });

  return formattedTask;
};

const x = formatTasks(scheduledScheduleWindow.autoTaskMap).map((t) => {
  return {
    title: t.name,
    start: t.start,
    end: t.end,
    type: "task",
  };
});

const final = [
  ...mockEvents.map((e) => {
    return {
      title: e.name,
      start: new Date(e.start!),
      end: new Date(e.end!),
      type: "event",
    };
  }),
  ...x,
];

function App() {
  return (
    <>
      <div>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={final}
            defaultView={Views.WEEK}
            timeslots={8}
            step={5}
            localizer={localizer}
            defaultDate={new Date(2026, 2, 18)}
            style={{ height: 700 }}
            eventPropGetter={(event, start, end, isSelected) => {
              let newStyle = {
                backgroundColor: "lightgrey",
                color: "black",
                borderRadius: "20px",
                border: "none",
              };

              if (event.type === "task") {
                newStyle.backgroundColor = "green";
              }

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

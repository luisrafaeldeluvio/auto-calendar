import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";
import type { AutoTask } from "./engine/types";
import { addMinutes } from "date-fns/fp";
import { CreateTaskButton } from "./components/createTask";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveScheduleWindow } from "./hooks/useLiveScheduleWindow";
import { useEffect, useMemo, useState } from "react";
import { getAllTimeSlot } from "./db/helpers";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const formatTasks = (
  agenda: Record<
    string,
    {
      tasks: AutoTask[];
      queue: AutoTask[];
    }
  >,
) => {
  const formattedTask = Object.entries(agenda).flatMap(
    ([day, { tasks, queue }]) => {
      const x = tasks.map((t) => {
        return {
          ...t,
          start: addMinutes(t.start!, new Date(Number(day))),
          end: addMinutes(t.end!, new Date(Number(day))),
          title: t.name,
        };
      });

      return x;
    },
  );

  return formattedTask;
};

function App() {
  const scheduleWindow = useLiveScheduleWindow(); // here too
  // okay so it appears to be working, but thet tasks are showing up 1 day in advance,
  // the problem is either in the rendering or in the data.
  const final = useMemo(() => {
    if (!scheduleWindow) return null;
    const x = formatTasks(scheduleWindow.autoTaskMap).map((t) => {
      // console.log(t.name, t.start);
      return {
        title: t.name,
        start: t.start,
        end: t.end, // advance is already showing up here.
        type: "task",
      };
    });
    return [...x];
  }, [scheduleWindow]);

  if (!final) return null;

  return (
    <>
      <CreateTaskButton></CreateTaskButton>
      <CreateTimeslotButton></CreateTimeslotButton>
      <div>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={final}
            defaultView={Views.WEEK}
            timeslots={8}
            step={5}
            localizer={localizer}
            defaultDate={new Date(2026, 3, 3)}
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

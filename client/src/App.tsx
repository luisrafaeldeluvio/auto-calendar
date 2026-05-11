import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay, formatDate } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";
import type { AutoTask } from "../../server/src/types";
import { addDays, addMinutes } from "date-fns/fp";
import { CreateTaskButton } from "./components/createTask";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveScheduleWindow } from "./hooks/useLiveScheduleWindow";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [date, setDate] = useState<Date>(new Date());
  const scheduleWindow = useLiveScheduleWindow();

  console.log(scheduleWindow);
  const final = useMemo(() => {
    if (!scheduleWindow) return null;
    const x = formatTasks(scheduleWindow.autoTaskMap).map((t) => {
      return {
        title: `${t.name} - s: ${formatDate(new Date(t.startDate), "MM-dd ")} - d: ${formatDate(new Date(t.dueDate), "MM-dd ")}`,
        start: t.start,
        end: t.end,
        type: "task",
      };
    });
    return [...x];
  }, [scheduleWindow]);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

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
            timeslots={3}
            step={5}
            localizer={localizer}
            date={date}
            onNavigate={handleNavigate}
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

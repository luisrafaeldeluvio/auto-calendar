import { useState } from "react";
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
  - [ ] buttons for calendar navigation
*/

function App() {
  const [currentDate, setCurrentDate] = useState(Temporal.Now.plainDateISO());
  const { startOfWeek, endOfWeek } = getWeekBounds(currentDate);

  const events = useLiveQuery(() =>
    db.events
      .filter((e) =>
        e.start
          ? e.start >= startOfWeek.toString() && e.start <= endOfWeek.toString()
          : false,
      )
      .toArray(),
  );
  return (
    <>
      <div>
        <CreateTaskButton></CreateTaskButton>
        <CreateEventButton></CreateEventButton>
        <CreateTimeslotButton></CreateTimeslotButton>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={
              events
                ? events?.map((e) => ({
                    title: e.name,
                    start: new Date(e.start),
                    end: new Date(e.end),
                  }))
                : undefined
            }
            defaultView={Views.WEEK}
            timeslots={3}
            step={5}
            localizer={localizer}
            date={new Date(currentDate.toString())}
            // onNavigate={}
            style={{ height: 700 }}
            eventPropGetter={() => {
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

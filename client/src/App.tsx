import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useState } from "react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function App() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <>
      <div>
        <div>
          <h1>calendar1</h1>
          <Calendar
            // events={}
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

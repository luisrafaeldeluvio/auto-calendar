import { events } from "./engine/mock-data";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
const locales = { "en-US": enUS };

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
console.log(new Date(2025, 2, 2));
function App() {
  return (
    <>
      <div>
        <div>
          <h1>calendar1</h1>
          <Calendar
            events={[events]}
            defaultView={Views.WEEK}
            step={15}
            timeslots={8}
            localizer={localizer}
            defaultDate={new Date(2025, 1, 28)}
            style={{ height: 700 }}
          />
        </div>
      </div>
    </>
  );
}

export default App;

// add npm i react-big-calendar

// slots and events can only be up to 24 hours, events can span days.
// agenda will be responsible for managing the current flow of time, which is two weeks.
// it will take the tasks and events that is in the current two weeks.

// agenda will have its own set of data where the tasks and events for the weeks will be placed.
// but this means that we will have to first work on the tasks due date and start date
// for the management to make sense.

// Nope, we need to make the agendas first to manage the DATES.

// Lets work on the tasks start date first. add a startDate type (as a unix time) on AutoTask,
// then lets work on the agenda. the agenda will pull the tasks where their startDate falls within
// two weeks timeframe. that is what we'll be using.

// for the agenda we will have an object where each key is the day
// and each value is an object of events and tasks.
// Ex:
// UNIX_TIME: {
//     tasks: [],
//     events: [],
// }

// so when getting the tasks and events, the agenda will sort it there.

// FUCCKKKK im confused on how to implement this. write it down and visualize it.

// technically the timefram is just week + 1, because when the current week is over, we'll just move to
// next week + 1 again.

import {
  addDays,
  areIntervalsOverlapping,
  interval,
  isWithinInterval,
  startOfWeek,
  type Interval,
} from "date-fns/fp";
import type { AutoTask, Event } from "./types";
import { events, tasks } from "./mock-data";
import { getTime } from "date-fns";
import { time } from "node:console";

interface Range {
  start: number;
  end: number;
}

interface Timeline {
  id: string;
  range: Range;
  agenda: Record<number, string[]>; // <unix, id[]>
}

const newTimeline = (currentDate: number) => {
  const timeline: Timeline = {
    id: crypto.randomUUID(),
    range: getTimelineRange(currentDate),
    agenda: [],
  };
  return timeline;
};

const getTimelineRange = (currentDate: number): Range => {
  const weekStart = getTime(startOfWeek(currentDate));

  return { start: weekStart, end: weekStart + 547200000 };
};

const getActiveTasks = (tasks: readonly AutoTask[], range: Readonly<Range>) =>
  tasks.filter((t) =>
    areIntervalsOverlapping(range)({ start: t.startDate, end: t.dueDate }),
  );

// process

const timeline = newTimeline(Date.now());
const activeTasks = getActiveTasks(tasks, timeline.range).map((t) => t.id);

console.log(timeline);
console.log(activeTasks);

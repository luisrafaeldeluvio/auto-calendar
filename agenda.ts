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
  getTime,
  interval,
  isWithinInterval,
  startOfWeek,
  type Interval,
} from "date-fns/fp";
import type { AutoTask } from "./types";
import { queuedTasks } from "./mock-data";

// interface Agenda {
//   id: string;
//   timeline: number[]; // each days in a week.
// }

// interface Timeline {
//   id: string;
//   agenda: Record<number, []>;
// }

// const createTimeline = () => {};

const thisWeek = getTime(startOfWeek(Date.now()));
const range = interval(addDays(7, thisWeek), thisWeek);

const getDueTasks = (
  tasks: readonly AutoTask[],
  range: Readonly<Interval<number, number>>,
) => {
  return tasks.filter(
    (t) =>
      isWithinInterval(range, t.dueDate) ||
      isWithinInterval(range, t.startDate),
  );
};

console.log(getDueTasks(queuedTasks, range));

// my problem is how am i supposed to get the two weeks for the timeline range?
// wait should i just get the current first day of this current week and use that as a base?
// i remember seeing a function for that in date-fns

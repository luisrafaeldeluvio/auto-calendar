import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
} from "date-fns/fp";
import type { AutoTask } from "./types";
import { tasks } from "./mock-data";
import { getTime } from "date-fns";

interface Range {
  start: number;
  end: number;
}

interface Timespan {
  id: string;
  range: Range;
  agenda: Record<number, string[]>; // <unix, id[]>
}

const newTimespan = (currentDate: number) => {
  const weekStart = getTime(startOfWeek(currentDate));

  const timespan: Timespan = {
    id: crypto.randomUUID(),
    range: { start: weekStart, end: weekStart + 547200000 },
    agenda: [],
  };

  return timespan;
};

// for the agenda, since tasks have start and due date

// say the selected day is monday, so it has value of 1.
// the tasks priority is normal, which is 1
// then the due date is also on monday, we reduce it ? 1-1 = 0

// another task: priority is normal
// due date is isTuesday, 2 = 1-2 = -1

// so this means that that it will prioritize the first task 0 > -1

// another tasks priority is high, which is 2
// then the due date is also on monday, we reduce it ? 2-1 = 1

// another test: say the chosen date is tuesday which is 2
// task is normal and due date is also thursday which is 4
// 1 - 4 = -3

// what if due date is tuesday - 2
// 1 - 2 = -1

// wait so is the chosen due date just reduce by 1? so that means that
// if the chosen day is tuesday, anything over 0 is past their due date.

// so the getActiveTasks is correct

// then we need to sort them out, thats where the priority thing will go.

// how will we decide how much task should be put in the day? since value of '0'
// means its due today, we should be putting tasks on the day where their value is
// more than or equal to 0.

const getActiveTasks = (tasks: readonly AutoTask[], range: Readonly<Range>) =>
  tasks.filter((t) =>
    areIntervalsOverlapping(range)({ start: t.startDate, end: t.dueDate }),
  );

// this is actually ok, the agenda will have all the ids of tasks that is in the week's range.
// we just need to sort them first. but how will we do that?
// do we set their date as the start date? or the due date? should the tasks have a specified
// date type instead of just start and end?

// maybe we can just put it their date as their start date? but on the sorting, if
// it's already filled up, it will return a queueu of rejected tasks to be reused.
// so maybe we move their start date up. do we update the tasks due date? probably not.
// what if we just move it on the agenda only? would that work? i think so. But what if we
// edit the task, the agenda should be removed/ moved depending on the edit instead.

const generateAgenda = (tasks: readonly AutoTask[], range: Readonly<Range>) => {
  const rangeArr = eachDayOfInterval(range);

  const agenda = rangeArr.reduce(
    (acc, r) => {
      const ranked = tasks.filter((t) => {
        const rank = t.weight - getDay(t.dueDate);
        const targetDay = getDay(r) - 1;

        if (rank >= targetDay) return true;
      });

      return { ...acc, [getTime(r)]: ranked };
    },
    {} as Record<number, AutoTask[]>,
  );

  return agenda;
};

// lets put each tasks on an key value, wher the key is a date.
// events  will be decided by their due date and priority

// say the selected day is monday, so it has value of 1.
// the tasks priority is normal, which is 1
// then the due date is also on monday, we reduce it ? 1-1 = 0

// another task: priority is normal
// due date is isTuesday, 2 = 1-2 = -1

// so this means that that it will prioritize the first task 0 > -1

// process

const timespan = newTimespan(Date.now());
export const activeTasks = getActiveTasks(tasks, timespan.range);

export const scheduled = scheduleTasks(
  activeTasks,
  [],
  [
    {
      id: "1",
      name: "ALL DAY",
      start: 0,
      end: 1440,
    },
  ],
);

// then auto schedule it
// then try making it show on ui

console.log(
  // JSON.stringify(scheduled, null, 2),
  JSON.stringify(generateAgenda(tasks, timespan.range), null, 2),
);

// const y = newTimespan(getTime(new Date()));

// console.time("heavy-task");
// const x = getActiveTasks(tasks, y.range);
// console.timeEnd("heavy-task");

import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
  subDays,
} from "date-fns/fp";
import type { AutoTask, TimeSlot, Event } from "./types";
import { getTime } from "date-fns";
import { scheduleTasks } from "./auto-schedule";

interface DateInterval {
  start: number;
  end: number;
}

type AutoTaskMap = Record<
  string,
  {
    tasks: AutoTask[];
    queue: AutoTask[];
  }
>;

export interface ScheduleWindow {
  id: string;
  dateInterval: DateInterval;
  autoTaskMap: AutoTaskMap;
}

export const getTasksInInterval = (
  tasks: readonly AutoTask[],
  dateInterval: Readonly<DateInterval>,
) =>
  tasks.filter((t) =>
    areIntervalsOverlapping(dateInterval)({
      start: t.startDate,
      end: t.dueDate,
    }),
  );

export const createDateInterval = (currentDate: number) => {
  const DATE_INTERVAL_MAX = 518400000 as const; // 6 days in ms.
  const weekStart = getTime(startOfWeek(currentDate));

  return { start: weekStart, end: weekStart + DATE_INTERVAL_MAX };
};

export const createScheduleWindow = (
  tasksInInterval: readonly AutoTask[],
  currentDate: number,
) => {
  const dateInterval = createDateInterval(currentDate);

  return {
    id: crypto.randomUUID(),
    dateInterval: dateInterval,
    autoTaskMap: createAutoTaskMap(tasksInInterval, dateInterval),
  } as ScheduleWindow;
};

export const sortScheduleWindow = (
  scheduleWindow: Readonly<ScheduleWindow>,
  events: readonly Event[],
  slots: readonly TimeSlot[],
) => {
  const newAutoTaskMap: AutoTaskMap = Object.entries(
    scheduleWindow.autoTaskMap,
  ).reduce((acc, [day, { tasks, queue }]) => {
    const scheduled = scheduleTasks(queue, events, slots);

    if (scheduled.ok) {
      console.log(scheduled.data.queue);
      return {
        ...acc,
        [day]: {
          tasks: scheduled.data.tasks,
          queue: scheduled.data.queue,
        },
      };
    } else {
      return {
        ...acc,
        [day]: {
          tasks: tasks,
          queue: queue,
        },
      };
    }
  }, {} as AutoTaskMap);

  return { ...scheduleWindow, autoTaskMap: newAutoTaskMap } as ScheduleWindow;
};

const createAutoTaskMap = (
  tasks: readonly AutoTask[],
  dateInterval: Readonly<DateInterval>,
) => {
  const dateIntervalArr = eachDayOfInterval(dateInterval);

  const x = dateIntervalArr.reduce(
    (acc, r) => {
      const ranked = tasks.filter((t, index) => {
        if (acc.rankedTaskPool.includes(t)) return false;
        if (t.startDate >= getTime(r)) return false;

        const targetDay = Math.min(getDay(r) + index, 6);
        const rank = t.weight - getDay(t.dueDate);

        if (rank > 0 || rank <= -1 + targetDay) return true;
      });

      return {
        result: {
          ...acc.result,
          [getTime(subDays(1, r))]: {
            tasks: [],
            queue: ranked,
          },
        },
        rankedTaskPool: [...acc.rankedTaskPool, ...ranked],
      };
    },
    {
      result: {},
      rankedTaskPool: [],
    } as {
      result: AutoTaskMap;
      rankedTaskPool: AutoTask[];
    },
  );

  return x.result;
};

// okay so the new problem is, say the start day is 2 and due date is 3
// when the slot is full, instead of moving the task on 3 it will just be moved to the queue

// Now i have this side effect where the tasks are only being scheduled on the start date when
// the timeslots are full instead of moving the task on other availabled days based on their due date.

// I was thinking of maybe getting all the leftover queue tasks, filtering those who still has
// a due date, and try assigning them to those days and ranking and sorting them again using bubble sort.
// This also means that for every iteration of the days, i take its leftover queue and move them to the
// queue of the next day and so on. IF it was not able to find on any of the days,
// the task will be put back on its original queue.

// okay so i dont need to rank and sort them again, i simply must just put them on the queue of the next
// day on sortScheduleWindow()

import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
} from "date-fns/fp";
import type { AutoTask, TimeSlot, Event } from "./types";
import { mockEvents, slots, tasks } from "./mock-data";
import { getTime, isThisQuarter } from "date-fns";
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

interface ScheduleWindow {
  id: string;
  dateInterval: DateInterval;
  autoTaskMap: AutoTaskMap;
}

const createDateInterval = (currentDate: number) => {
  const DATE_INTERVAL_MAX = 518400000 as const; // 6 days in ms.
  const weekStart = getTime(startOfWeek(currentDate));

  return { start: weekStart, end: weekStart + DATE_INTERVAL_MAX };
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

        const rank = t.weight - getDay(t.dueDate);
        const targetDay = Math.min(getDay(r) + index, 6);

        if (rank > 0 || rank < -2 + targetDay) return true;
      });

      return {
        result: {
          ...acc.result,
          [getTime(r)]: {
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

const createScheduleWindow = (
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

const getTasksInInterval = (
  tasks: readonly AutoTask[],
  dateInterval: Readonly<DateInterval>,
) =>
  tasks.filter((t) =>
    areIntervalsOverlapping(dateInterval)({
      start: t.startDate,
      end: t.dueDate,
    }),
  );

const sortScheduleWindow = (
  scheduleWindow: Readonly<ScheduleWindow>,
  events: readonly Event[],
  slots: readonly TimeSlot[],
) => {
  const newAutoTaskMap: AutoTaskMap = Object.entries(
    scheduleWindow.autoTaskMap,
  ).reduce((acc, [day, { tasks, queue }]) => {
    const scheduled = scheduleTasks(queue, events, slots);

    if (scheduled.ok) {
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

// ----------------------------

const activeTasks = getTasksInInterval(
  tasks,
  createDateInterval(getTime(new Date())),
);

export const timespan = createScheduleWindow(activeTasks, Date.now());

export const scheduledScheduleWindow = sortScheduleWindow(
  timespan,
  mockEvents,
  slots,
);

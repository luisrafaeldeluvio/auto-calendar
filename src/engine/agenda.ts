import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
} from "date-fns/fp";
import type { AutoTask } from "./types";
import { tasks } from "./mock-data";
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

interface ScheduleWindow {
  id: string;
  dateInterval: DateInterval;
  autoTaskMap: AutoTaskMap;
}

const createScheduleWindow = (
  tasksInInterval: readonly AutoTask[],
  currentDate: number,
) => {
  const weekStart = getTime(startOfWeek(currentDate));
  const dateInterval = { start: weekStart, end: weekStart + 547200000 };

  return {
    id: crypto.randomUUID(),
    dateInterval: dateInterval,
    autoTaskMap: createAutoTaskMap(tasksInInterval, dateInterval),
  } as ScheduleWindow;
};

const createDateInterval = (currentDate: number) => {
  const DATE_INTERVAL_MAX = 518400000 as const; // 6 days in ms.
  const weekStart = getTime(startOfWeek(currentDate));

  return { start: weekStart, end: weekStart + DATE_INTERVAL_MAX };
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

const createAutoTaskMap = (
  tasks: readonly AutoTask[],
  dateInterval: Readonly<DateInterval>,
) => {
  const dateIntervalArr = eachDayOfInterval(dateInterval);

  return dateIntervalArr.reduce(
    (acc, r) => {
      const ranked = tasks.filter((t) => {
        const rank = t.weight - getDay(t.dueDate);
        const targetDay = getDay(r) - 1;

        if (rank >= targetDay) return true;
      });

      return {
        ...acc,
        [getTime(r)]: {
          tasks: [],
          queue: ranked,
        },
      };
    },
    {} as Record<
      number,
      {
        tasks: AutoTask[];
        queue: AutoTask[];
      }
    >,
  ) as AutoTaskMap;
};

const sortScheduleWindow = (timespan: Readonly<ScheduleWindow>) => {
  const newAutoTaskMap: AutoTaskMap = Object.entries(
    timespan.autoTaskMap,
  ).reduce((acc, [day, { tasks, queue }]) => {
    const scheduled = scheduleTasks(
      queue,
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

  return { ...timespan, autoTaskMap: newAutoTaskMap } as ScheduleWindow;
};

// ----------------------------

const activeTasks = getTasksInInterval(
  tasks,
  createDateInterval(getTime(new Date())),
);

export const timespan = createScheduleWindow(activeTasks, Date.now());

export const scheduledScheduleWindow = sortScheduleWindow(timespan);

// now add error checkers, those "ok" like in autoschedule

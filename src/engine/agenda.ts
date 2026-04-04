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
        if (getTime(r) <= t.startDate) return false;

        const rank = t.weight - getDay(t.dueDate);
        const targetDay = Math.min(getDay(r) + index, 6);

        if (rank > 0 || rank < -2 + targetDay) return true;
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

// TODO
// - [/] Move to using indexeddb
// - [/] Create buttons/forms for creating tasks
// - [] Add a can be started on variable on auto tasks
//    - wait did we ever use startDate on the algorithm?
//       because if not, then thats already the can be started on.
// dito sa algorithm (i think sortScheduleWindow ilalagay and start date)

// confirmed. we will use the startDate as can be started on.
// we will do this by adding stuff on createAutoTaskMap();

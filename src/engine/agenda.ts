import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
} from "date-fns/fp";
import type { AutoTask, TimeSlot, Event } from "./types";
import { mockEvents, slots, tasks } from "./mock-data";
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

  return dateIntervalArr.reduce((acc, r) => {
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
  }, {} as AutoTaskMap);
};
// it seems that every queue of the map has the same copy of the tasks.
// so the problem is in createAutoTaskMap
// it could be a problem in the ranked
// wait it is the problem with the rank!!!
// its because were just filtering the same tasks Array.
// so even though we already used a task in a dateFnsLocalizer, it is still being used
// to solve this, we need to createa another variable for getting the tasks, and everytime we use
// the tasks there, we remove it from the Array.; but wouldnt that make it impure?

// try putting the ranking on another function first, i swear this can be fixed by using recursions

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

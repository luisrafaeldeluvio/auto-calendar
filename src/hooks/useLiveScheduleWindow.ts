import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "../db/db";
import { areIntervalsOverlapping, getTime } from "date-fns/fp";
import {
  createDateInterval,
  createScheduleWindow,
  sortScheduleWindow,
  type ScheduleWindow,
} from "../engine/agenda";
import type { AutoTask, TimeSlot } from "../engine/types";
import { getAllTimeSlot } from "../db/helpers";

export const useLiveScheduleWindow = () => {
  const [dateInterval] = useState(createDateInterval(getTime(new Date())));
  const slots: TimeSlot[] | undefined = useLiveQuery(() => getAllTimeSlot());
  const activeAutoTasks: AutoTask[] | undefined = useLiveQuery(
    () =>
      db.autoTasks
        .filter((t) =>
          areIntervalsOverlapping(dateInterval, {
            start: t.startDate,
            end: t.dueDate,
          }),
        )
        .toArray(),
    [dateInterval],
  );

  const scheduledWindow: ScheduleWindow | null = useMemo(() => {
    if (!activeAutoTasks || !slots) return null;

    // eslint-disable-next-line react-hooks/purity
    const timespan = createScheduleWindow(activeAutoTasks, Date.now());

    return sortScheduleWindow(timespan, [], slots);
  }, [activeAutoTasks, slots]);

  return scheduledWindow;
};

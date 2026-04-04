import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "../db/db";
import { areIntervalsOverlapping, getTime } from "date-fns/fp";
import {
  createDateInterval,
  createScheduleWindow,
  sortScheduleWindow,
} from "../engine/agenda";
import type { TimeSlot } from "../engine/types";

export const useLiveScheduleWindow = (slots: TimeSlot[]) => {
  const [dateInterval] = useState(createDateInterval(getTime(new Date())));

  const activeAutoTasks = useLiveQuery(
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

  const scheduledWindow = useMemo(() => {
    if (!activeAutoTasks) return null;

    // eslint-disable-next-line react-hooks/purity
    const timespan = createScheduleWindow(activeAutoTasks, Date.now());

    return sortScheduleWindow(timespan, [], slots);
  }, [activeAutoTasks, slots]);

  return scheduledWindow;
};

import { Temporal } from "@js-temporal/polyfill";
import { agenda } from "../core/agenda";
import { db } from "../db/db";
import { getAllTimeSlots } from "../db/helpers";
import {
  fromEventDbModel,
  fromTimeSlotDbModel,
} from "../db/serializeDataObject";
import { type Event } from "../types/types";
import { getWeekBounds } from "./getWeekBounds";

export const sortTasks = async () => {
  const { startOfWeek, endOfWeek } = getWeekBounds();
  const toSort = await db.events
    /*
    - [ ] I think this introduced a new bug on left over tasks. I have a task { weight: 0}
    that was previously sorted. I added a new task, in theory the previous task will not be sorted.
    Instead the task's start and end was pushed to the beggining. Not exactly a bug, more of a 
    feature oversight since the algorithm now also handle tasks that was already sorted. To handle this, 
    maybe I can set the start and date of tasks in queue to null in scheduleTasksInSlot.
  */
    .filter(
      (e) =>
        e.isSortable /*&& !e.isSorted*/ &&
        e.startDate >= startOfWeek.toString() &&
        e.dueDate <= endOfWeek.toString(),
    )
    .toArray()
    .then((arr) => arr.map((e) => fromEventDbModel(e) as Event<null>));

  /*
    Using .filter is slow, should use .where instead but since isBusy: boolean it won't work
    because of https://dexie.org/docs/Indexable-Type. Though it will be fairly easy to implement
    by just changing it to a number on EventDbModel and using to... and from...
  */
  const busyEvents = await db.events
    .filter((e) => e.isBusy === true && !e.isSortable)
    .toArray()
    .then((arr) =>
      arr.map((e) => fromEventDbModel(e) as Event<Temporal.PlainDateTime>),
    );

  const slots = await getAllTimeSlots().then((r) =>
    r.ok ? r.data.map((s) => fromTimeSlotDbModel(s)) : [],
  );

  /* 
    FUTURE NOTE:
    - [ ] This should have an options on how many weeks it should get (i.e. 2 weeks)
    for configurations.
  */
  const ag = agenda(
    Temporal.Now.plainDateISO(),
    endOfWeek.toPlainDate(),
    toSort ?? [],
    busyEvents ?? [],
    slots,
  );

  const toUpdate = ag.sortedTasks.map((e) => {
    return {
      key: e.id,
      changes: {
        start: e.start.toString(),
        end: e.end.toString(),
        isBusy: e.isBusy,
        isSorted: e.isSortable,
      },
    };
  });

  try {
    db.events.bulkUpdate(toUpdate);
  } catch (e) {
    console.log("on update", e);
  }
};

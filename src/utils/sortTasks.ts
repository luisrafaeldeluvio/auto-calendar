import { Temporal } from "@js-temporal/polyfill";
import { agenda } from "../core/agenda";
import { db } from "../db/db";
import { getAllTimeSlots } from "../db/helpers";
import { fromEventDbModel, fromTimeSlotDbModel } from "../db/serializeDataObject";
import { type Event } from "../types/types";

export const sortTasks = async () => {
  const toSort = await db.events
    /*
    - [ ] I should add a limit on the events to be sorted and busyEvents based on their start and due date.
    The task should be within the agenda (1 week). We can do this by comparing start and date as strings.
    "2026-07-23T06:55:00" > "2026-07-23T07:25:00" = false
    "2026-08-23T06:55:00" > "2026-07-23T07:25:00" = true
    Yes, we can compare dates even if they're string thanks to Lexicographic order.
    - [ ] I need to work on the how the agenda range will work first before doing that.
    Maybe set it to 1 week first.
    - [ ] I think this introduced a new bug on left over tasks. I have a task { weight: 0}
    that was previously sorted. I added a new task, in theory the previous task will not be sorted.
    Instead the task's start and end was pushed to the beggining. Not exactly a bug, more of a 
    feature oversight since the algorithm now also handle tasks that was already sorted. To handle this, 
    maybe I can set the start and date of tasks in queue to null in scheduleTasksInSlot.
  */
    .filter((e) => e.isSortable /*&& !e.isSorted*/)
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

  const ag = agenda(
    // update this to start and end in App.tsx
    // We have a problem, the tasks still get assigned to past days,
    // when tasks should be anchored to the current day.
    // so to solve this, we can maybe add a max to the start, like
    // max(start, dateToday)
    // maybe i need to have a dedicated file for those stuff like start and date.
    // arent thhey called global state or something??   
    Temporal.PlainDate.from({ month: 7, day: 19, year: 2026 }),
    Temporal.PlainDate.from({ month: 7, day: 26, year: 2026 }),
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
import { Temporal } from "@js-temporal/polyfill";

export type Result<T, E = string> =
  { ok: true; data: T } | { ok: false; error: E };

export type SlotError = "INVALID_RANGE" | "TIME_EXCEEDED";

export type Weight = 1 | 2 | 3 | 4;

export interface TimeSlot {
  id: string;
  name: string;
  start: Temporal.PlainTime;
  end: Temporal.PlainTime;
}

export interface Event {
  type: "event" | "task";
  id: string;
  name: string;
  notes: string;

  start: Temporal.PlainTime | null;
  end: Temporal.PlainTime | null;
  // waitt i think currying can be used here!!!!!
  // so in our scheduleTasksInSlot, we assign minutes there from 0 to 1440 (full 24h)
  // but in agenda, this will be turned into their dates, so what if, on the scheduleTasksInSlot,
  // for the start and end we just return a function, that params a Temporal.PlainDateTime and then
  // add the minutes + the param to return the final Temporal.PlainDateTime..
  // wait maybe just set it to Temporal.PlainTime

  isBusy: boolean;
  isDone: boolean;
  isSortable: boolean;
  isSorted: boolean;

  duration: Temporal.Duration | null;
  weight: Weight;
  slotId: string;

  buffer: {
    before: Temporal.Duration | null;
    after: Temporal.Duration | null;
  };

  startDate: Temporal.PlainDateTime | null;
  dueDate: Temporal.PlainDateTime | null;
}

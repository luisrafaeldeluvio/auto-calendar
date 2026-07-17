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

export type EventInterval = Temporal.PlainTime | Temporal.PlainDateTime | null;

export interface Event<T extends EventInterval = null> {
  type: "event" | "task";
  id: string;
  name: string;
  notes: string;

  start:  T;
  end:  T;

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

export interface TasksSchedule<T extends EventInterval = null> {
  sortedTasks: Event<T>[];
  queue: Event<null>[];
}
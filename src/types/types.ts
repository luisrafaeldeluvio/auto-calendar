import { Temporal } from "@js-temporal/polyfill";

export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type SlotError = "INVALID_RANGE" | "TIME_EXCEEDED";

export type Weight = 1 | 2 | 3 | 4;

export interface TimeSlot {
  id: string;
  name: string;
  start: Temporal.PlainTime;
  end: Temporal.PlainTime;
}

export interface TimeSlotDbModel {
  id: string;
  name: string;
  start: string;
  end: string;
}
export type EventInterval = Temporal.PlainDateTime | null;

export interface Event<T extends EventInterval> {
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

  duration: Temporal.Duration;
  weight: Weight;
  slotId: string;

  bufferBefore: Temporal.Duration;
  bufferAfter: Temporal.Duration;

  startDate: Temporal.PlainDateTime | null;
  dueDate: Temporal.PlainDateTime | null;
}


export interface EventDbModel {
  type: "event" | "task";
  id: string;
  name: string;
  notes: string;

  start: string | null; // date-time in the RFC 9557 format
  end: string | null; // date-time in the RFC 9557 format

  isBusy: boolean;
  isDone: boolean;
  isSortable: boolean;
  isSorted: boolean;

  duration: string; // duration in the ISO 8601 format
  weight: Weight;
  slotId: string;

  buffer_before: string; // duration in the ISO 8601 format
  buffer_after: string; // duration in the ISO 8601 format

  startDate: string; //  date-time in the RFC 9557 format
  dueDate: string; //  date-time in the RFC 9557 format
}

export interface TasksSchedule {
  sortedTasks: Event<Temporal.PlainDateTime>[];
  queue: Event<null>[];
}

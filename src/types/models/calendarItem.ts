import { Temporal } from "@js-temporal/polyfill";
import type { Weight } from "../common";

interface BaseItem {
  id: string;
  name: string;
  notes: string;

  isBusy: boolean;
  isDone: boolean;
  isSortable: boolean;
  isSorted: boolean;

  duration: Temporal.Duration;
  weight: Weight;
  slotId: string;

  bufferBefore: Temporal.Duration;
  bufferAfter: Temporal.Duration;

  startDate: Temporal.PlainDateTime;
  dueDate: Temporal.PlainDateTime;
}

export interface CalendarEvent extends BaseItem {
  type: "event";
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
}

export interface CalendarTask extends BaseItem {
  type: "task";
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
}

export interface CalendarTaskUnscheduled extends BaseItem {
  type: "task";
  start: null;
  end: null;
}

export type CalendarItem = CalendarEvent | CalendarTask;

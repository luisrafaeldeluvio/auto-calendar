import { Temporal } from "@js-temporal/polyfill";
import type { Weight } from "../common";

export type EventInterval = Temporal.PlainDateTime | null;

export interface Event<T extends EventInterval> {
  type: "event" | "task";
  id: string;
  name: string;
  notes: string;

  start: T;
  end: T;

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

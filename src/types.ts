export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export interface TimeSlot {
  id: string;
  name: string;
  start: number; //in minutes since 00:00
  end: number;
}

export type SlotError = "INVALID_RANGE" | "OVERLAP" | "TIME_EXCEEDED";

type Weight = 1 | 2 | 3 | 4;

export interface Event {
  id: string;
  name: string;
  notes?: string;

  start: number;
  end: number;

  isBusy: boolean;
  buffer: {
    before: number;
    after: number;
  };
}

export interface Task extends Event {
  isDone: boolean;
  isAutoScheduled: boolean;
}

export interface AutoTask extends Omit<Task, "start" | "end"> {
  duration: number; // Up to 1440 (23 hours and 30 minutes)
  weight: Weight; // 1-4 with 4 being the highest
  // slotId: string;

  start?: number;
  end?: number;
}

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

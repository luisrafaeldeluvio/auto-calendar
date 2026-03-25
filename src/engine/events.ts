import type { Result, Event } from "./types";

type MutationData = { events: Event[]; event: Event };

export const addEvent = (
  events: Event[],
  event: Omit<Event, "id" | "isBusy"> & Partial<Pick<Event, "isBusy">>,
): Result<MutationData, ""> => {
  const newEvent = {
    ...event,
    id: crypto.randomUUID(),
    isBusy: event.isBusy ?? true,
  };
  const newEvents = [...events, newEvent];

  return { ok: true, data: { events: newEvents, event: newEvent } };
};

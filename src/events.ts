// lets createa a function (or better yet a class) for managing the dates
// for a class, which should probably made into days or maybe 2 weeks?
//     - yes here, so we can have events that have any dates and we'll just pull the events
//         that is in this time frame.
// there, the timeline will be managed, like you will place the events and tasks there

// but what about the auto scheduler? maybe we can get the dates of the events from the class itself.
// then the auto scheduler will ignore the slots of the events

// maybe create a text-based ui there kinda like:
// 2:45 | EVENT 1
// 3:00 | EVENT 1
// 3:15 | EVENT 2
// 3:30 | TASK 1

import type { Result, Event } from "./types";

type MutationData = { events: Event[]; event: Event };

export const addEvent = (
  events: Event[],
  event: Omit<Event, "id" | "isBusy" | "buffer"> &
    Partial<Pick<Event, "isBusy" | "buffer">>,
): Result<MutationData, ""> => {
  const newEvent = {
    ...event,
    id: crypto.randomUUID(),
    isBusy: event.isBusy ?? true,
    buffer: event.buffer ?? {
      before: 0,
      after: 0,
    },
  };
  const newEvents = [...events, newEvent];

  return { ok: true, data: { events: newEvents, event: newEvent } };
};

import type { TimeSlot, Event, Task, AutoTask } from "../engine/types";
import { db } from "./db";

// Timeslots
export const addTimeSlot = (slot: TimeSlot) => db.timeslots.add(slot);
export const addTimeSlots = (slots: TimeSlot[]) => db.timeslots.bulkAdd(slots);

export const getTimeSlot = (id: string) => db.timeslots.get(id);
export const getAllTimeSlot = () => db.timeslots.toArray();

export const updateTimeSlot = (id: string, changes: Partial<TimeSlot>) =>
  db.timeslots.update(id, changes);

export const deleteTimeSlot = (id: string) => db.timeslots.delete(id);

// Events

export const addEvent = (event: Event) => db.events.add(event);
export const addEvents = (events: Event[]) => db.events.bulkAdd(events);

export const getEvent = (id: string) => db.events.get(id);
export const getAllEvents = () => db.events.toArray();

export const updateEvent = (id: string, changes: Partial<Event>) =>
  db.events.update(id, changes);

export const deleteEvent = (id: string) => db.events.delete(id);

// Tasks

export const addTask = (task: Task) => db.tasks.add(task);
export const addTasks = (tasks: Task[]) => db.tasks.bulkAdd(tasks);

export const getTask = (id: string) => db.tasks.get(id);
export const getAllTasks = () => db.tasks.toArray();

export const updateTask = (id: string, changes: Partial<Task>) =>
  db.tasks.update(id, changes);

export const deleteTask = (id: string) => db.tasks.delete(id);

// Autotasks

export const addAutoTask = (autoTask: AutoTask) => db.autoTasks.add(autoTask);
export const addAutoTasks = (autoTasks: AutoTask[]) =>
  db.autoTasks.bulkAdd(autoTasks);

export const getAutoTask = (id: string) => db.autoTasks.get(id);
export const getAllAutoTasks = () => db.autoTasks.toArray();

export const updateAutoTask = (id: string, changes: Partial<AutoTask>) =>
  db.autoTasks.update(id, changes);

export const deleteAutoTask = (id: string) => db.autoTasks.delete(id);

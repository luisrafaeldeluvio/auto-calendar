import type { Result, AutoTask } from "./types";

type AutoTaskError =
  | "INVALID_START_DATE"
  | "INVALID_DUE_DATE"
  | "INVALID_DATE_RANGE";

export const createAutoTask = (
  autoTask: Readonly<
    Omit<AutoTask, "id" | "isBusy" | "isDone"> &
      Partial<Pick<AutoTask, "isBusy">>
  >,
): Result<AutoTask, AutoTaskError> => {
  if (Number.isNaN(autoTask.startDate))
    return { ok: false, error: "INVALID_START_DATE" };

  if (Number.isNaN(autoTask.dueDate))
    return { ok: false, error: "INVALID_DUE_DATE" };

  if (autoTask.startDate > autoTask.dueDate)
    return { ok: false, error: "INVALID_DATE_RANGE" };

  const newAutoTask = {
    ...autoTask,
    id: crypto.randomUUID(),
    isBusy: autoTask.isBusy ?? true,
    isDone: false,
  };

  return { ok: true, data: newAutoTask };
};

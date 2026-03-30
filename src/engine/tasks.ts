import type { Result, AutoTask } from "./types";

export const createAutoTask = (
  autoTask: Readonly<
    Omit<AutoTask, "id" | "isBusy" | "isDone"> &
      Partial<Pick<AutoTask, "isBusy">>
  >,
): Result<AutoTask, ""> => {
  const newAutoTask = {
    ...autoTask,
    id: crypto.randomUUID(),
    isBusy: autoTask.isBusy ?? true,
    isDone: false,
  };

  return { ok: true, data: newAutoTask };
};

import { sortTasks } from "../utils/sortTasks";

export const SortTasksButton = () => {
  return <button onClick={async () => await sortTasks()}>Sort Tasks</button>;
};

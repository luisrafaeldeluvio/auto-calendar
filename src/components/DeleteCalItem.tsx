import { deleteCalItem } from "../db/queries/events";

interface DeleteCalItemButtonProps {
  calItemId: string;
  onOk?: () => void;
  onError?: (error: string) => void;
}

export const DeleteCalItemButton = ({
  calItemId,
  onOk,
  onError,
}: DeleteCalItemButtonProps) => {
  const handleClick = async () => {
    const isDelete = confirm("Delete item?");
    if (!isDelete) return;

    const result = await deleteCalItem(calItemId);
    if (result.ok) onOk && onOk();
    else onError && onError(result.error);
  };
  return (
    <>
      <button type="button" onClick={handleClick}>
        Delete
      </button>
    </>
  );
};

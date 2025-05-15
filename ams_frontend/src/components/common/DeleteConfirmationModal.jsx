const DeleteConfirmationModal = ({
  show,
  onCancel,
  onConfirm,
  isDeleting,
  isSingle,
  count,
  strings,
}) => {
  if (!show) return null;

  const heading = isSingle
    ? strings.modals.deleteConfirmation.single
    : strings.modals.deleteConfirmation.multiple.replace("{count}", count);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{heading}</h3>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            {strings.buttons.no}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
            disabled={isDeleting}
          >
            {isDeleting ? strings.buttons.deleting : strings.buttons.yes}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

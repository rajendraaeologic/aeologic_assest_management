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
              className={`px-4 py-2 rounded-md ${
                  isDeleting
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-gray-300 hover:bg-gray-400"
              }`}
              disabled={isDeleting}
          >
            {strings.buttons.no}
          </button>
          <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md ${
                  isDeleting
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
              }`}
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

import React from "react";

const SelectFirstPopup = ({ show, onClose, strings }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {strings.modals.selectFirst}
        </h3>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
          >
            {strings.buttons.ok}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectFirstPopup;

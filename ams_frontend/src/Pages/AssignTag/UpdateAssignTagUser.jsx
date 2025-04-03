import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

const UpdateAssignTagUser = ({ onClose }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();

    document.body.style.overflow = "hidden";

    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Submitted!");
  };

  return (
    <div
      className={`fixed overflow-scroll inset-0 px-1 md:px-0 bg-black bg-opacity-50 z-50 flex justify-center items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className={`mt-[20px] w-[820px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Title and Close Button */}
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            Edit Assign Tag
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-5 px-10">
          <form onClick={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="rfid"
                  className="block text-sm font-medium text-gray-700"
                >
                  RFID
                </label>
                <select
                  id="rfid"
                  name="rfid"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    RFID
                  </option>
                  <option value="">001125363527287239iAABB</option>
                  <option value="">E01125363527287239iAAB3B</option>
                  <option value="">A001125363527287239iAABB</option>
                  <option value="">M01125363527287239iAABB</option>
                </select>
              </div>

              <div className="w-full md:mt-4">
                <label
                  htmlFor="assetname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Asset Name
                </label>
                <select
                  id="assetname"
                  name="assetname"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Asset Name
                  </option>
                  <option value="">Liber</option>
                </select>
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <select
                  id="code"
                  name="code"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                </select>
              </div>

              {/* row 2  */}

              <div className="w-full md:mt-4">
                <label
                  htmlFor="remark"
                  className="block text-sm font-medium text-gray-700"
                >
                  Remark
                </label>
                <input
                  type="text"
                  id="remark"
                  name="remark"
                  placeholder="Remark"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  placeholder=" date"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder=" Location"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              {/* Row 3 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="assignto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assign To
                </label>
                <select
                  id="assignto"
                  name="assignto"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Assign To
                  </option>
                  <option value="">admin</option>
                  <option value="">admin123</option>
                  <option value="">Ravi</option>
                  <option value="">Ravi2</option>
                </select>
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="usercode"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Code
                </label>
                <select
                  id="usercode"
                  name="usercode"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                </select>
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="lastassignto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Assign To
                </label>
                <select
                  id="lastassignto"
                  name="lastassignto"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Last Assign To
                  </option>
                  <option value="">admin</option>
                  <option value="">admin123</option>
                  <option value="">Ravi</option>
                  <option value="">Ravi2</option>
                </select>
              </div>
              {/* Row 4 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="usercode"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Code
                </label>
                <select
                  id="usercode"
                  name="usercode"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                </select>
              </div>
            </div>
            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
              >
                Close
              </button>
              <button className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAssignTagUser;

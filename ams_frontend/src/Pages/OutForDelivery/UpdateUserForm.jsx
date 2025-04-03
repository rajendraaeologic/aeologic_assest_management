import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
const UpdateUserForm = ({ onClose }) => {
  const users = {
    username: "",
    code: "",
    department: "",
    departmentcode: "",
    contact: "",
    email: "",
  };

  // fetch data
  const { id } = useParams();
  const [isUpdateUser, setIsUpdateUser] = useState(users);

  const updateUserHandler = (e) => {
    const { name, value } = e.target;
    setIsUpdateUser({ ...isUpdateUser, [name]: value });
  };
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
      className={`fixed inset-0 overflow-y-scroll px-1 md:px-0 bg-black bg-opacity-50 z-50 flex justify-center items-start transition-opacity duration-300 ${
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
            Edit User Details
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-4">
          <form onClick={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="w-full">
                <label
                  htmlFor="assetname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Asset Name
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="assetname"
                  name="assetname"
                  placeholder="Asset Name"
                  onChange={updateUserHandler}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Code"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Name
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Status
                  </option>
                  <option value="">InWard</option>
                  <option value="">OutWard</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="w-full">
                <label
                  htmlFor="rfid"
                  className="block text-sm font-medium text-gray-700"
                >
                  RFID
                </label>
                <input
                  ref={firstInputRef}
                  type="rfid"
                  id="rfid"
                  name="rfid"
                  placeholder="RFID"
                  onChange={updateUserHandler}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="remark"
                  className="block text-sm font-medium text-gray-700"
                >
                  Remark
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="remark"
                  name="remark"
                  placeholder="Remark"
                  onChange={updateUserHandler}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  ref={firstInputRef}
                  type="date"
                  id="date"
                  name="date"
                  placeholder="date"
                  onChange={updateUserHandler}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              {/* Row 3 */}
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
              <div className="w-full md:mt-4">
                <label
                  htmlFor="assignto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assign To
                </label>
                <input
                  type="text"
                  id="assignto"
                  name="assignto"
                  placeholder=" Assign To"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="usercode"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Code
                </label>
                <input
                  type="text"
                  id="usercode"
                  name="usercode"
                  placeholder=" User Code"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              {/* row */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="lastassignto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Assign To
                </label>
                <input
                  type="text"
                  id="lastassignto"
                  name="lastassignto"
                  placeholder="Last Assign To"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="usercode"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Code
                </label>
                <input
                  type="text"
                  id="usercode"
                  name="usercode"
                  placeholder=" User Code"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
            </div>
            <hr className="mt-10"></hr>
            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 md:mt-6 mt-4 mb-5 mr-5">
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

export default UpdateUserForm;

import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import {
  createRegistrationUser,
  getAllUser,
} from "../../Features/userRegistrationSlice";

const UserAddForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [usersFormData, setUsersFormData] = useState({
    username: "",
    code: "",
    department: "",
    departmentcode: "",
    contact: "",
    emailid: "",
  });

  useEffect(() => {
    // Focus on first input when the modal is visible
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

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUsersFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(createRegistrationUser(usersFormData));
    dispatch(getAllUser());
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50  overflow-y-scroll md:overflow-y-hidden px-1 md:px-0 flex justify-center items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className={`mt-[20px] w-[500px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/*  Close Button */}
        <div className="flex justify-between px-6 bg-[#3bc0c3]  rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">Add User</h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="w-full">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Name
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="username"
                  name="username"
                  onChange={changeHandler}
                  value={usersFormData.username}
                  placeholder="Name"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
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
                  onChange={changeHandler}
                  value={usersFormData.code}
                  placeholder="Code"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Name
                </label>
                <select
                  id="department"
                  name="department"
                  onChange={changeHandler}
                  value={usersFormData.department}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                >
                  <option value="" disabled>
                    Department
                  </option>
                  <option value="Accounts">Accounts</option>
                  <option value="Bio">Bio</option>
                  <option value="HR Department">HR Department</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="w-full md:mt-6">
                <label
                  htmlFor="departmentcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Code
                </label>
                <select
                  id="departmentcode"
                  name="departmentcode"
                  onChange={changeHandler}
                  value={usersFormData.departmentcode}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                  <option value="12">12</option>
                </select>
              </div>
              <div className="w-full md:mt-6">
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  onChange={changeHandler}
                  value={usersFormData.contact}
                  placeholder="Mobile"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-6">
                <label
                  htmlFor="emailid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Id
                </label>
                <input
                  type="email"
                  id="emailid"
                  name="emailid"
                  onChange={changeHandler}
                  value={usersFormData.emailid}
                  placeholder="Email"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                />
              </div>
            </div>

            <hr className="md:mt-10 mt-5" />

            <div className="flex justify-end gap-4 md:mt-6 mt-4 md:mb-5 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAddForm;

import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { getAllUser, updateUser } from "../../Features/userRegistrationSlice";

const UpdateUserForm = ({ onClose }) => {
  const selectedUser = useSelector(
    (state) => state.userRegisterData.selectedUser
  );

  // Log when selectedUser changes
  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser]);

  const dispatch = useDispatch();

  // Initial state for form data
  const [updateData, setUpdateData] = useState({
    username: "",
    code: "",
    department: "",
    departmentcode: "",
    contact: "",
    emailid: "",
  });

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

  // Update form fields when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setUpdateData(selectedUser);
    }
  }, [selectedUser]);

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

  const updateUserHandler = (e) => {
    const { name, value } = e.target;
    setUpdateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Corrected handleUpdate method
  const handleUpdate = async (e) => {
    e.preventDefault(); // Fixed typo
    await dispatch(updateUser(updateData));
    dispatch(getAllUser());
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center overflow-y-scroll md:overflow-y-hidden px-1 md:px-0 items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`mt-[20px] w-[500px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            Edit User Details
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  value={updateData.username || ""}
                  placeholder="Name"
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
                  value={updateData.code || ""}
                  onChange={updateUserHandler}
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
                  onChange={updateUserHandler}
                  value={updateData.department || ""}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Department
                  </option>
                  <option value="Accounts">Accounts</option>
                  <option value="Bio">Bio</option>
                  <option value="HR Department">HR Department</option>
                </select>
              </div>

              <div className="w-full md:mt-6">
                <label
                  htmlFor="departmentcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <select
                  id="departmentcode"
                  name="departmentcode"
                  onChange={updateUserHandler}
                  value={updateData.departmentcode || ""}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                  <option value="1">1</option>
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
                  value={updateData.contact || ""}
                  onChange={updateUserHandler}
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
                  value={updateData.emailid || ""}
                  onChange={updateUserHandler}
                  placeholder="Email"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
            </div>

            <hr className="md:mt-10 mt-5" />

            <div className="flex justify-end gap-4 md:mt-6 mt-4 md:mb-5 mb-2 mr-5">
              <button
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                onClick={handleClose}
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

export default UpdateUserForm;

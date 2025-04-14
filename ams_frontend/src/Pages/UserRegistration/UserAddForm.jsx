import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  createRegistrationUser,
  getAllUser,
} from "../../Features/services/userService.js";
import { toast } from "react-toastify";
import departmentStrings from "../../locales/departmentStrings.js";
import { getAllBranches } from "../../Features/slices/branchSlice.js";
import { getAllOrganizations } from "../../Features/slices/organizationSlice.js";
import { getAllDepartments } from "../../Features/slices/departmentSlice.js";

const UserAddForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const { organizations } = useSelector((state) => state.organizationData);
  const { branches } = useSelector((state) => state.branchData);
  const { departments } = useSelector((state) => state.departmentData);

  const [usersFormData, setUsersFormData,] = useState({
    userName: "",
    phone: "",
    email: "",
    userRole: "",
    code: "",
    department: "",
    departmentCode: "",
    branchId: "",
    password: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    dispatch(getAllBranches());
    dispatch(getAllOrganizations());
    dispatch(getAllDepartments());
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

    if (name === "branchId") {
      setSelectedBranchId(value);
      setUsersFormData((prevData) => ({
        ...prevData,
        branchId: value,
        departmentCode: "", // Reset department on branch change
      }));
    }
    else if (name === "departmentCode") {
      const selectedDept = departments.find((dept) => dept.id === value);
      setUsersFormData((prevData) => ({
        ...prevData,
        departmentCode: value,
        department: selectedDept?.departmentName || "", // ✅ capture department name too
      }));
    }else {
      setUsersFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createRegistrationUser(usersFormData));
      dispatch(getAllUser());
      toast.success("User added successfully!", {
        position: "top-right",
        autoClose: 1000,
      });
      handleClose();
    } catch (error) {
      toast.error("Failed to add user", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  const filteredBranches = branches?.filter(
      (branch) => branch.company?.id === selectedOrgId
  );

  // ✅ Fixed department filter logic
  const filteredDepartments = departments?.filter(
      (dept) => dept.branch?.id === selectedBranchId
  );

  return (
      <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-scroll md:overflow-y-hidden px-1 md:px-0 flex justify-center items-start transition-opacity duration-300 ${
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
            <h2 className="text-[17px] font-semibold text-white">Add User</h2>
            <button onClick={handleClose} className="text-white rounded-md">
              <IoClose className="h-7 w-7" />
            </button>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                      ref={firstInputRef}
                      type="text"
                      name="userName"
                      onChange={changeHandler}
                      value={usersFormData.userName}
                      placeholder="Name"
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                      type="tel"
                      name="phone"
                      onChange={changeHandler}
                      value={usersFormData.phone}
                      placeholder="Contact Number"
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Email ID
                  </label>
                  <input
                      type="email"
                      name="email"
                      onChange={changeHandler}
                      value={usersFormData.email}
                      placeholder="Emailid"
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                      type="password"
                      name="password"
                      onChange={changeHandler}
                      value={usersFormData.password}
                      placeholder="Password"
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    User Code
                  </label>
                  <input
                      type="text"
                      name="code"
                      onChange={changeHandler}
                      value={usersFormData.code}
                      placeholder="Enter User Code"
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    {
                      departmentStrings.addDepartment.formLabels
                          .selectOrganization
                    }
                  </label>
                  <select
                      value={selectedOrgId}
                      onChange={(e) => {
                        setSelectedOrgId(e.target.value);
                        setSelectedBranchId("");
                        setUsersFormData((prevData) => ({
                          ...prevData,
                          branchId: "",
                          departmentCode: "",
                        }));
                      }}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md outline-none"
                  >
                    <option value="">Select Organization</option>
                    {organizations?.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.organizationName}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    {departmentStrings.addDepartment.formLabels.selectBranch}
                  </label>
                  <select
                      name="branchId"
                      value={usersFormData.branchId}
                      onChange={changeHandler}
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  >
                    <option value="">Select Branch</option>
                    {filteredBranches?.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branchName}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                      name="departmentCode"
                      value={usersFormData.departmentCode}
                      onChange={changeHandler}
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  >
                    <option value="">Select Department</option>
                    {filteredDepartments?.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                      name="userRole"
                      onChange={changeHandler}
                      value={usersFormData.userRole}
                      className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                      required
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
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

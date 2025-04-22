import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectUser,
  selectAllUsers,
  deselectAllUsers,
} from "../../Features/userRegistrationSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import UserAddForm from "./UserAddForm";
import UpdateUserForm from "./UpdateUserForm";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllUser } from "../../Features/services/userService.js";
import { setSelectedUser } from "../../Features/userRegistrationSlice";

import { deleteUsersFromDB } from "../../Features/services/userService.js";
const UserRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { users, selectedUsers, currentPage, rowsPerPage } = useSelector(
      (state) => state.userRegisterData
  );

  useEffect(() => {
    dispatch(getAllUser());
  }, [dispatch, users.length]);

  const [isAddUserRegistrationModel, setIsAddUserRegistrationModel] =
      useState(false);
  const [isUpdateUserRegistrationModel, setIsUpdateUserRegistrationModel] =
      useState(false);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(users.length / rowsPerPage);

  const [searchUsers, setSearchUsers] = useState({
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
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchUsers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredUsers = users?.filter((user) => {
    return Object.entries(searchUsers).every(([key, searchValue]) =>
        (user[key] || "").toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const handleNavigate = () => {
    navigate("/dashboard");
  };

  const handlePrev = () => {
    if (currentPage > 0) dispatch(setCurrentPage(currentPage - 1));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) dispatch(setCurrentPage(currentPage + 1));
  };

  const handleDeleteSelectedUsers = () => {
    console.log(selectedUsers);
    dispatch(deleteUsersFromDB(selectedUsers));
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      dispatch(selectAllUsers());
    } else {
      dispatch(deselectAllUsers());
    }
  };

  const handleToggleUserSelection = (_id) => {
    dispatch(toggleSelectUser(_id));
  };

  const handlerUpdateData = (user) => {
    dispatch(setSelectedUser(user));
  };

  return (
      <div
          className={`w-full min-h-screen bg-slate-100 px-2  ${
              isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
          }`}
      >
        <div
            className={`mx-auto min-h-screen ${
                isSidebarOpen
                    ? "pl-0 md:pl-[250px] lg:pl-[250px]"
                    : "pl-0 md:pl-[90px] lg:pl-[90px]"
            }`}
        >
          <div className="pt-24">
            <div className="flex justify-between mx-5 mt-2">
              <h3 className="text-xl font-semibold text-[#6c757D]">User List</h3>
              <div className="flex gap-3 md:mr-8">
                <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                  <CiSaveUp2 className="h-6 w-6" />
                </button>
                <button
                    onClick={() => setIsAddUserRegistrationModel(true)}
                    className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
                >
                  Add User
                </button>
              </div>
            </div>

            <div className="mx-5 flex gap-2 mb-4">
              <button onClick={handleNavigate} className="text-[#6c757D] ">
                Dashboard
              </button>
              <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
              <p className="text-[#6c757D]">Registration</p>
            </div>
          </div>

          <div className=" min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
            <div className="flex Users-center gap-2 pt-8 ml-3">
              <p>Show</p>
              <div className="border-2 flex justify-evenly">
                <select
                    value={rowsPerPage}
                    onChange={(e) =>
                        dispatch(setRowsPerPage(parseInt(e.target.value)))
                    }
                    className="outline-none px-1"
                >
                  {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                  ))}
                </select>
              </div>
              <p>Entries</p>
            </div>

            <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
              <table
                  className="table-auto min-w-max text-left border-collapse"
                  style={{ tableLayout: "fixed" }}
              >
                <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Name</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Organization</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Branch</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Department</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Code</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Department</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Department Code</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Contact</th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">Email Id</th>
                  <th className="px-4 py-4 border border-gray-300 w-[100px]">Action</th>
                  <th className="px-4 py-4 border border-gray-300 w-[100px]">
                    <div className="flex justify-center Users-center ">
                      <div className="">
                        <label className="flex Users-center">
                          <input
                              type="checkbox"
                              checked={selectedUsers.length === users.length && users.length > 0}
                              onChange={handleSelectAllUsers}
                              className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedUsers}>
                        <MdDelete className="h-6 w-6" />
                      </button>
                    </div>
                  </th>
                </tr>
                </thead>

                {/* Search Row */}
                <tbody>
                <tr className="bg-gray-100">
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        placeholder="Name"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.userName}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        placeholder="Organization"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.organizationName || ""}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="branchName"
                        name="branchName"
                        placeholder="Branch"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.branchName || ""}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="departmentName"
                        name="departmentName"
                        placeholder="Department"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.departmentName || ""}
                        onChange={handleSearchChange}
                    />
                  </td>

                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="code"
                        name="code"
                        placeholder="Code"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.code}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="department"
                        name="department"
                        placeholder="Department"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.department}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="text"
                        id="departmentCode"
                        name="departmentCode"
                        placeholder="Department Code"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.departmentCode}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Contact"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.phone}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email Id"
                        className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                        value={searchUsers.email}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                </tr>
                </tbody>

                {/* Table Body */}
                <tbody>
                {currentRows.map((user, index) => (
                    <tr
                        key={user._id || index}
                        className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      <td className="px-4 py-4 border border-gray-300">{user.userName || "-"}</td>
                      <td className="px-4 py-4 border border-gray-300">{user.organization?.organizationName }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.branch?.branchName }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.department?.departmentName }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.code }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.department }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.departmentCode }</td>
                      <td className="px-4 py-4 border border-gray-300">{user.phone}</td>
                      <td className="px-4 py-4 border border-gray-300">{user.email }</td>
                      <td className="px-4 py-2 border border-gray-300">
                        <button
                            onClick={() => {
                              setIsUpdateUserRegistrationModel(true);
                              handlerUpdateData(user);
                            }}
                            className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                            type="checkbox"
                            checked={selectedUsers?.includes(user._id) ?? false}
                            onChange={() => handleToggleUserSelection(user._id)}
                        />
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-end mr-4">
              <div className="px-2 py-2 border-2">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="text-black"
                >
                  Previous
                </button>
                <span className="px-2 space-x-1 ">
                <span
                    className={`${
                        currentPage === 0
                            ? "bg-[#3bc0c3] py-1 px-3"
                            : "border-2 py-1 px-3"
                    }`}
                >
                  {currentPage + 1}
                </span>

                <span
                    className={`${
                        currentPage + 1 === totalPages
                            ? "py-1 px-3 bg-[#3bc0c3]"
                            : "py-1 px-3"
                    }`}
                >
                  {totalPages}
                </span>
              </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage + 1 === totalPages}
                    className="text-black"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Modals */}
        {isAddUserRegistrationModel && (
            <UserAddForm onClose={() => setIsAddUserRegistrationModel(false)} />
        )}
        {isUpdateUserRegistrationModel && (
            <UpdateUserForm
                onClose={() => setIsUpdateUserRegistrationModel(false)}
            />
        )}
      </div>
  );
};

export default UserRegistration;
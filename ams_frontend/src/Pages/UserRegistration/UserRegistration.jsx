import React, { useState, useEffect, useContext, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";

import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectUser,
  selectAllUsers,
  deselectAllUsers,
  setSelectedUser,
} from "../../Features/slices/userSlice";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { CiSaveUp2 } from "react-icons/ci";
import UserAddForm from "./UserAddForm";
import UpdateUserForm from "./UpdateUserForm";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllUsers, uploadExcel } from "../../Features/slices/userSlice";
import { deleteUser } from "../../Features/slices/userSlice";
import userStrings from "../../locales/userStrings";
import DownloadTemplateButton from "./DownloadTemplateButton";

const SkeletonLoader = () => {
  return (
      <>
        {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {[...Array(9)].map((_, cellIndex) => (
                  <td
                      key={cellIndex}
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </td>
              ))}
              <td
                  className="px-2 py-4 border border-gray-300"
                  style={{ maxWidth: "100px", wordWrap: "break-word" }}
              >
                <div className="h-4 bg-gray-300 rounded"></div>
              </td>
            </tr>
        ))}
      </>
  );
};

const UserRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const { isSidebarOpen } = useContext(SliderContext);

  const { users, selectedUsers, currentPage, rowsPerPage } = useSelector(
      (state) => state.usersData
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
  const [isUpdateUserFormOpen, setIsUpdateUserFormOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(users.length / rowsPerPage);

  const [searchFilters, setSearchFilters] = useState({
    userName: "",
    phone: "",
    email: "",
    status: "",
    userRole: "",
    branchName: "",
    departmentName: "",
    organizationName: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        await dispatch(getAllUsers());
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [dispatch, users.length]);

  useEffect(() => {
    if (
        showDeleteConfirmation ||
        showSelectFirstPopup ||
        showDeleteSuccessPopup
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDeleteConfirmation, showSelectFirstPopup, showDeleteSuccessPopup]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredUsers = users?.filter((user) => {
    const lowerCase = (str) => (str || "").toLowerCase();
    return (
        lowerCase(user.userName).includes(lowerCase(searchFilters.userName)) &&
        lowerCase(user.phone).includes(lowerCase(searchFilters.phone)) &&
        lowerCase(user.email).includes(lowerCase(searchFilters.email)) &&
        lowerCase(user.status).includes(lowerCase(searchFilters.status)) &&
        lowerCase(user.userRole).includes(lowerCase(searchFilters.userRole)) &&
        lowerCase(user.branch?.branchName).includes(
            lowerCase(searchFilters.branchName)
        ) &&
        lowerCase(user.department?.departmentName).includes(
            lowerCase(searchFilters.departmentName)
        )
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

  // const handlePageChange = (page) => {
  //   dispatch(setCurrentPage(page));
  // };

  const handleDeleteSelectedUsers = () => {
    if (selectedUsers.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      dispatch(selectAllUsers());
    } else {
      dispatch(deselectAllUsers());
    }
  };

  const handleToggleUserSelection = (id) => {
    dispatch(toggleSelectUser(id));
  };

  const handlerUpdateData = (user) => {
    dispatch(setSelectedUser(user));
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser([userToDelete]));
      setDeleteMessage(userStrings.user.modals.deleteSuccess.single);
    } else if (selectedUsers.length > 0) {
      dispatch(deleteUser(selectedUsers));
      setDeleteMessage(
          userStrings.user.modals.deleteSuccess.multiple.replace(
              "{count}",
              selectedUsers.length
          )
      );
    }
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
    setShowDeleteSuccessPopup(true);
    setTimeout(() => {
      setShowDeleteSuccessPopup(false);
    }, 2000);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  const closeSelectFirstPopup = () => {
    setShowSelectFirstPopup(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      setUploadError(null);
      setUploadSuccess(null);
      e.target.value = null;

      dispatch(uploadExcel(file))
          .unwrap()
          .then((res) => {
            setIsProcessing(false);
            setUploadSuccess(res);

            return dispatch(getAllUsers()).unwrap();
          })
          .catch((error) => {
            console.log("error", error);
            setIsProcessing(false);
            setUploadError(error);
          });
    }
  };

  const handleClosePopup = () => {
    setUploadSuccess(null);
    setUploadError(null);
  };

  // Generate page numbers for pagination
  // const getPageNumbers = () => {
  //   const pages = [];
  //   const maxVisiblePages = 5;
  //
  //   if (totalPages <= maxVisiblePages) {
  //     for (let i = 0; i < totalPages; i++) {
  //       pages.push(i);
  //     }
  //   } else {
  //     const half = Math.floor(maxVisiblePages / 2);
  //     let start = currentPage - half;
  //     let end = currentPage + half;
  //
  //     if (start < 0) {
  //       start = 0;
  //       end = maxVisiblePages - 1;
  //     }
  //
  //     if (end >= totalPages) {
  //       end = totalPages - 1;
  //       start = end - maxVisiblePages + 1;
  //     }
  //
  //     if (start > 0) {
  //       pages.push(0);
  //       if (start > 1) {
  //         pages.push("ellipsis-start");
  //       }
  //     }
  //
  //     for (let i = start; i <= end; i++) {
  //       if (i >= 0 && i < totalPages) {
  //         pages.push(i);
  //       }
  //     }
  //
  //     if (end < totalPages - 1) {
  //       if (end < totalPages - 2) {
  //         pages.push("ellipsis-end");
  //       }
  //       pages.push(totalPages - 1);
  //     }
  //   }
  //
  //   return pages;
  // };

  return (
      <div
          className={`w-full min-h-screen bg-slate-100 px-2 ${
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
              <h3 className="text-xl font-semibold text-[#6c757D]">
                {userStrings.user.title}
              </h3>
              <div className="flex gap-3 md:mr-8">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                <div className="flex gap-2">
                  <DownloadTemplateButton />
                  <button
                      className="px-4 py-2 bg-[#3BC0C3] flex justify-between gap-1 text-white rounded-lg"
                      onClick={handleButtonClick}
                  >
                    <CiSaveUp2 className="h-6 w-6"></CiSaveUp2>
                    {userStrings.user.buttons.blukUsersCreate}
                  </button>
                </div>

                <button
                    onClick={() => setIsAddUserFormOpen(true)}
                    className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
                >
                  {userStrings.user.buttons.addUser}
                </button>
              </div>
            </div>

            <div className="mx-5 flex gap-2 mb-4">
              <button onClick={handleNavigate} className="text-[#6c757D]">
                {userStrings.user.breadcrumb.dashboard}
              </button>
              <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
              <p className="text-[#6c757D]">
                {userStrings.user.breadcrumb.registration}
              </p>
            </div>
          </div>

          <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
            <div className="flex items-center gap-2 pt-8 ml-3">
              <p>{userStrings.user.table.showEntries}</p>
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
              <p>{userStrings.user.table.entries}</p>
            </div>

            <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
              <table
                  className="table-auto min-w-max text-left border-collapse"
                  style={{ tableLayout: "fixed" }}
              >
                <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.userName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.phone}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.email}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.status}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.userRole}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.organizationName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.branchName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.departmentName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.action}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {userStrings.user.table.headers.deleteAll}
                  </th>
                </tr>
                </thead>

                <tbody>
                <tr className="bg-gray-100">
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="userName"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.userName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.userName}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="phone"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.phone
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.phone}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="email"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.email
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.email}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="status"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.status
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.status}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="userRole"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.userRole
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.userRole}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="branchName"
                        placeholder={
                          userStrings.user.table.searchPlaceholders
                              .organizationName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.organizationName}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="branchName"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.branchName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.branchName}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <input
                        type="text"
                        name="departmentName"
                        placeholder={
                          userStrings.user.table.searchPlaceholders.departmentName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchFilters.departmentName}
                        onChange={handleSearchChange}
                    />
                  </td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{ maxWidth: "100px", wordWrap: "break-word" }}
                  ></td>
                  <td
                      className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                      style={{ maxWidth: "100px", wordWrap: "break-word" }}
                  >
                    <div className="flex justify-center items-center">
                      <div className="">
                        <label className="flex items-center">
                          <input
                              type="checkbox"
                              checked={
                                  selectedUsers.length === users.length &&
                                  users.length > 0
                              }
                              onChange={handleSelectAllUsers}
                              className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedUsers}>
                        <MdDelete className="h-6 w-6 text-[red]" />
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>

                <tbody>
                {isLoading ? (
                    <SkeletonLoader />
                ) : currentRows.length > 0 ? (
                    currentRows.map((user, index) => (
                        <tr
                            key={user.id || index}
                            className={`${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-200 divide-y divide-gray-300`}
                        >
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.userName}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.phone}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.email}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.status}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.userRole}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.company?.organizationName ||
                                userStrings.user.notAvailable.emptyText}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.branch?.branchName ||
                                userStrings.user.notAvailable.emptyText}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {user.department?.departmentName ||
                                userStrings.user.notAvailable.emptyText}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{ maxWidth: "100px", wordWrap: "break-word" }}
                          >
                            <div className="flex ">
                              <button
                                  onClick={() => {
                                    setIsUpdateUserFormOpen(true);
                                    handlerUpdateData(user);
                                  }}
                                  className="px-3 py-2 rounded-sm "
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                  onClick={() => handleDeleteClick(user)}
                                  className="px-3 py-2 rounded-sm   text-[red]"
                              >
                                <MdDelete className="h-6 w-6" />
                              </button>
                            </div>
                          </td>
                          <td
                              className="px-2 py-2 text-center border border-gray-300"
                              style={{ maxWidth: "100px", wordWrap: "break-word" }}
                          >
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleToggleUserSelection(user.id)}
                            />
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td
                          colSpan="9"
                          className="px-2 py-4 text-center border border-gray-300"
                      >
                        {userStrings.user.table.noData}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Updated Pagination UI */}
              <div className="flex justify-between items-center mt-4 mx-4">
                  <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
                  </div>

                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                      <button
                          onClick={handlePrev}
                          disabled={currentPage === 0 || totalPages === 0}
                          className={`px-4 py-2 border-r border-gray-300 ${
                              currentPage === 0 || totalPages === 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "hover:bg-gray-100"
                          }`}
                      >
                          {userStrings.user.buttons.previous}
                      </button>

                      <div className="px-4 py-2">
                          {`${startIndex + 1}–${Math.min(startIndex + rowsPerPage, filteredUsers.length)} of ${filteredUsers.length}`}
                      </div>

                      <button
                          onClick={handleNext}
                          disabled={currentPage + 1 >= totalPages || totalPages === 0}
                          className={`px-4 py-2 border-l border-gray-300 ${
                              currentPage + 1 >= totalPages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "hover:bg-gray-100"
                          }`}
                      >
                          {userStrings.user.buttons.next}
                      </button>
                  </div>
              </div>
          </div>
        </div>
        {isAddUserFormOpen && (
            <UserAddForm onClose={() => setIsAddUserFormOpen(false)} />
        )}
        {isUpdateUserFormOpen && (
            <UpdateUserForm onClose={() => setIsUpdateUserFormOpen(false)} />
        )}

        {(isProcessing || uploadSuccess || uploadError) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
                {/* Loader */}
                {isProcessing && (
                    <>
                      <div className="flex justify-center items-center mb-3">
                        <div className="w-8 h-8 border-4 border-[#3bc0c3] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {userStrings.user.modals.doNotCloseWindow}
                      </p>
                    </>
                )}

                {/* Success */}
                {!isProcessing && uploadSuccess && (
                    <>
                      <h3 className="text-lg font-semibold mb-2 text-green-600">
                        {uploadSuccess.message}
                      </h3>
                      <p className="mb-4">
                        {userStrings.user.modals.successCount.replace(
                            "{count}",
                            uploadSuccess.successCount
                        )}
                      </p>
                      <button
                          onClick={handleClosePopup}
                          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                      >
                        {userStrings.user.buttons.close}
                      </button>
                    </>
                )}

                {/* Error */}

                {!isProcessing && uploadError && (
                    <>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">
                        {uploadError.message &&
                            uploadError.message.split(":")[0].trim()}
                      </h3>
                      <button
                          onClick={handleClosePopup}
                          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        {userStrings.user.buttons.close}
                      </button>
                    </>
                )}
              </div>
            </div>
        )}

        {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {userToDelete
                      ? userStrings.user.modals.deleteConfirmation.single
                      : userStrings.user.modals.deleteConfirmation.multiple.replace(
                          "{count}",
                          selectedUsers.length
                      )}
                </h3>
                <div className="flex justify-end gap-4">
                  <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    {userStrings.user.buttons.no}
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {userStrings.user.buttons.yes}
                  </button>
                </div>
              </div>
            </div>
        )}
        {showSelectFirstPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {userStrings.user.modals.selectFirst}
                </h3>
                <div className="flex justify-end">
                  <button
                      onClick={closeSelectFirstPopup}
                      className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
                  >
                    {userStrings.user.buttons.ok}
                  </button>
                </div>
              </div>
            </div>
        )}
        {showDeleteSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">{deleteMessage}</h3>
              </div>
            </div>
        )}
      </div>
  );
};

export default UserRegistration;

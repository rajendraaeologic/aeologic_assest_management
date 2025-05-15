import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader";
import PaginationControls from "../../components/common/PaginationControls";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import SelectFirstPopup from "../../components/common/SelectFirstPopup";

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
import { deleteUser, setSearchTerm } from "../../Features/slices/userSlice";
import userStrings from "../../locales/userStrings";
import DownloadTemplateButton from "./DownloadTemplateButton";
import debounce from "lodash.debounce";

const UserRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const { isSidebarOpen } = useContext(SliderContext);

  const {
    users,
    selectedUsers,
    currentPage,
    rowsPerPage,
    totalUsers,
    totalPages,
    searchTerm,
    loading,
    error,
  } = useSelector((state) => state.usersData);

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  const options = ["5", "10", "25", "50", "100"];

  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(setSearchTerm(value));
      setIsSearching(false);
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      getAllUsers({
        page: currentPage,
        limit: rowsPerPage,
        searchTerm: searchTerm.trim(),
      })
    );
  }, [dispatch, currentPage, rowsPerPage, searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setIsSearching(true);
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

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

  const handleNavigate = () => {
    navigate("/dashboard");
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };
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

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (userToDelete) {
        await dispatch(deleteUser([userToDelete])).unwrap();
        dispatch(
          getAllUsers({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(userStrings.user.modals.deleteSuccess.single);
      } else if (selectedUsers.length > 0) {
        await dispatch(deleteUser(selectedUsers)).unwrap();
        dispatch(
          getAllUsers({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
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
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Success  toast
  useEffect(() => {
    if (showDeleteSuccessPopup && deleteMessage) {
      toast.success(deleteMessage, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  }, [showDeleteSuccessPopup, deleteMessage]);
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
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
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

            {/* Right side: Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="border p-2 rounded w-64"
                value={localSearchTerm}
                onChange={handleSearchChange}
              />
              {isSearching && (
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 animate-pulse">
                  Searching...
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  {[
                    userStrings.user.table.headers.userName,
                    userStrings.user.table.headers.phone,
                    userStrings.user.table.headers.email,
                    userStrings.user.table.headers.status,
                    userStrings.user.table.headers.userRole,
                    userStrings.user.table.headers.organizationName,
                    userStrings.user.table.headers.branchName,
                    userStrings.user.table.headers.departmentName,
                    userStrings.user.table.headers.action,
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 border border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}

                  <th className="px-2 py-2 border border-gray-300 min-w-[100px] max-w-[100px] whitespace-nowrap">
                    {userStrings.user.table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1 mt-1">
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
                      <button onClick={handleDeleteSelectedUsers}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={10} />
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {userStrings.user.table.noData}
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* User Data Columns */}
                      {[
                        user.userName,
                        user.phone,
                        user.email,
                        user.status,
                        user.userRole,
                        user.company?.organizationName,
                        user.branch?.branchName,
                        user.department?.departmentName,
                      ].map((field, i) => (
                        <td
                          key={i}
                          className="px-2 py-2 border border-gray-300 break-words align-top"
                        >
                          {field || userStrings.user.notAvailable.emptyText}
                        </td>
                      ))}

                      {/* Action Buttons */}
                      <td className="px-2 py-2 border border-gray-300 text-center align-top">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setIsUpdateUserFormOpen(true);
                              handlerUpdateData(user);
                            }}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="px-3 py-2 rounded-sm text-[red]"
                          >
                            <MdDelete className="h-6 w-6" />
                          </button>
                        </div>
                      </td>

                      {/* Checkbox Selection */}
                      <td className="px-2 py-2 border border-gray-300 text-center align-top">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleToggleUserSelection(user.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalItems={totalUsers}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
            previousLabel={userStrings.user.buttons.previous}
            nextLabel={userStrings.user.buttons.next}
          />
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

      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        isSingle={!!userToDelete}
        count={selectedUsers.length}
        strings={userStrings.user}
      />
      {/* Select First Popup */}
      <SelectFirstPopup
        show={showSelectFirstPopup}
        onClose={closeSelectFirstPopup}
        strings={userStrings.user}
      />
    </div>
  );
};

export default UserRegistration;

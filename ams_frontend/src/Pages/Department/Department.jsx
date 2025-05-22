import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import departmentStrings from "../../locales/departmentStrings";

import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectDepartment,
  selectAllDepartments,
  deselectAllDepartments,
  setSelectedDepartment,
} from "../../Features/slices/departmentSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddDepartment from "./AddDepartment";
import UpdateDepartment from "./UpdateDepartment";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import {
  getAllDepartments,
  setSearchTerm,
} from "../../Features/slices/departmentSlice";
import { deleteDepartment } from "../../Features/slices/departmentSlice";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader";
import PaginationControls from "../../components/common/PaginationControls";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import SelectFirstPopup from "../../components/common/SelectFirstPopup";
const UserDepartment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const {
    departments,
    selectedDepartments,
    currentPage,
    rowsPerPage,
    totalPages,
    totalDepartments,
    searchTerm,
    loading,
    error,
  } = useSelector((state) => state.departmentData);

  const [isAddDepartment, setIsAddDepartment] = useState(false);
  const [isUpdateDepartment, setIsUpdateDepartment] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
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

  // Fetch users when page, limit, or searchTerm changes
  useEffect(() => {
    dispatch(
      getAllDepartments({
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
  const handleDeleteSelectedDepartments = () => {
    if (selectedDepartments.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleSelectAllDepartments = (e) => {
    if (e.target.checked) {
      dispatch(selectAllDepartments());
    } else {
      dispatch(deselectAllDepartments());
    }
  };

  const handleToggleDepartmentSelection = (id) => {
    dispatch(toggleSelectDepartment(id));
  };

  const handlerUpdateData = (department) => {
    dispatch(setSelectedDepartment(department));
  };

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (departmentToDelete) {
        // Single department delete
        await dispatch(deleteDepartment([departmentToDelete])).unwrap();
        dispatch(
          getAllDepartments({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(
          departmentStrings.department.modals.deleteSuccess.single
        );
      } else if (selectedDepartments.length > 0) {
        // Multiple departments delete
        await dispatch(deleteDepartment(selectedDepartments)).unwrap();
        dispatch(
          getAllDepartments({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(
          departmentStrings.department.modals.deleteSuccess.multiple.replace(
            "{count}",
            selectedDepartments.length
          )
        );
      }

      setShowDeleteConfirmation(false);
      setDepartmentToDelete(null);
      dispatch(deselectAllDepartments());
      setShowDeleteSuccessPopup(true);

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 2000);
    } catch (error) {
      toast.error(error || "Delete operation failed", {
        position: "top-right",
        autoClose: 2000,
      });

      // Reset states
      setShowDeleteConfirmation(false);
      setDepartmentToDelete(null);
      dispatch(deselectAllDepartments());
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
    setDepartmentToDelete(null);
  };

  const closeSelectFirstPopup = () => {
    setShowSelectFirstPopup(false);
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
              {departmentStrings.department.title}
            </h3>
            <div className="flex gap-3 md:mr-8">

              <button
                onClick={() => setIsAddDepartment(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {departmentStrings.department.buttons.addDepartment}
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D]">
              {departmentStrings.department.breadcrumb.dashboard}
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">
              {departmentStrings.department.breadcrumb.department}
            </p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
              <p>{departmentStrings.department.table.showEntries}</p>
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
              <p>{departmentStrings.department.table.entries}</p>
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
                    departmentStrings.department.table.headers.departmentName,
                    departmentStrings.department.table.headers.branchName,
                    departmentStrings.department.table.headers.branchLocation,
                    departmentStrings.department.table.headers.action,
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 border border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}

                  {/* Delete All Checkbox Header */}
                  <th className="px-2 py-2 border border-gray-300 min-w-[100px] max-w-[100px] whitespace-nowrap">
                    {departmentStrings.department.table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedDepartments.length === departments.length &&
                            departments.length > 0
                          }
                          onChange={handleSelectAllDepartments}
                          className="mr-2"
                        />
                      </label>
                      <button onClick={handleDeleteSelectedDepartments}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={5} />
                ) : departments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {departmentStrings.department.table.noData}
                    </td>
                  </tr>
                ) : (
                  departments.map((department, index) => (
                    <tr
                      key={department.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* Main Data Columns */}
                      {[
                        department.departmentName,
                        department.branch?.branchName,
                        department.branch?.branchLocation,
                      ].map((field, i) => (
                        <td
                          key={i}
                          className="px-2 py-2 border border-gray-300 break-words align-top"
                        >
                          {field ||
                            departmentStrings.department.notAvailable.emptyText}
                        </td>
                      ))}

                      {/* Action Buttons */}
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setIsUpdateDepartment(true);
                              handlerUpdateData(department);
                            }}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(department)}
                            className="px-3 py-2 rounded-sm text-[red]"
                          >
                            <MdDelete className="h-6 w-6" />
                          </button>
                        </div>
                      </td>

                      {/* Checkbox Selection */}
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(department.id)}
                          onChange={() =>
                            handleToggleDepartmentSelection(department.id)
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalItems={totalDepartments}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
            onPageChange={handlePageChange}
            previousLabel={departmentStrings.department.buttons.previous}
            nextLabel={departmentStrings.department.buttons.next}
          />
        </div>
      </div>

      {/* Modals */}
      {isAddDepartment && (
        <AddDepartment onClose={() => setIsAddDepartment(false)} />
      )}
      {isUpdateDepartment && (
        <UpdateDepartment onClose={() => setIsUpdateDepartment(false)} />
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        isSingle={!!departmentToDelete}
        count={selectedDepartments.length}
        strings={departmentStrings.department}
      />
      {/* Select First Popup */}
      <SelectFirstPopup
        show={showSelectFirstPopup}
        onClose={closeSelectFirstPopup}
        strings={departmentStrings.department}
      />
    </div>
  );
};

export default UserDepartment;

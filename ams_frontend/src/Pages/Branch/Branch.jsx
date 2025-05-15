import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectBranch,
  selectAllBranches,
  deselectAllBranches,
  setSelectedBranch,
} from "../../Features/slices/branchSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddBranch from "./AddBranch";
import UpdateBranch from "./updateBranch";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import {
  getAllBranches,
  setSearchTerm,
} from "../../Features/slices/branchSlice";
import { deleteBranch } from "../../Features/slices/branchSlice";
import ChipsList from "../../components/common/UI/ChipsList";
import branchStrings from "../../locales/branchStrings";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader";
import PaginationControls from "../../components/common/PaginationControls";
import SelectFirstPopup from "../../components/common/SelectFirstPopup";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
const Branch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const {
    branches,
    selectedBranches,
    currentPage,
    rowsPerPage,
    totalPages,
    totalBranches,
    searchTerm,
    loading,
    error,
  } = useSelector((state) => state.branchData);

  const [isAddBranch, setIsAddBranch] = useState(false);
  const [isUpdateBranch, setIsUpdateBranch] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
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
      getAllBranches({
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

  const handleDeleteSelectedBranches = () => {
    if (selectedBranches.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleSelectAllBranches = (e) => {
    if (e.target.checked) {
      dispatch(selectAllBranches());
    } else {
      dispatch(deselectAllBranches());
    }
  };

  const handleToggleBranchSelection = (id) => {
    dispatch(toggleSelectBranch(id));
  };

  const handlerUpdateData = (branch) => {
    dispatch(setSelectedBranch(branch));
  };

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (branchToDelete) {
        // Single branch delete
        await dispatch(deleteBranch([branchToDelete])).unwrap();
        dispatch(
          getAllBranches({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(branchStrings.branch.modals.deleteSuccess.single);
      } else if (selectedBranches.length > 0) {
        // Multiple branches delete
        await dispatch(deleteBranch(selectedBranches)).unwrap();
        dispatch(
          getAllBranches({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(
          branchStrings.branch.modals.deleteSuccess.multiple.replace(
            "{count}",
            selectedBranches.length
          )
        );
      }

      setShowDeleteConfirmation(false);
      setBranchToDelete(null);
      dispatch(deselectAllBranches());
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
      setBranchToDelete(null);
      dispatch(deselectAllBranches());
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
    setBranchToDelete(null);
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
              {branchStrings.branch.title}
            </h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddBranch(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {branchStrings.branch.buttons.addBranch}
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D]">
              {branchStrings.branch.breadcrumb.dashboard}
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">
              {branchStrings.branch.breadcrumb.branch}
            </p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
              <p>{branchStrings.branch.table.showEntries}</p>
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
              <p>{branchStrings.branch.table.entries}</p>
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
                    branchStrings.branch.table.headers.branchName,
                    branchStrings.branch.table.headers.branchLocation,
                    branchStrings.branch.table.headers.organizationName,
                    branchStrings.branch.table.headers.departmentName,
                    branchStrings.branch.table.headers.action,
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
                    {branchStrings.branch.table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedBranches.length === branches.length &&
                            branches.length > 0
                          }
                          onChange={handleSelectAllBranches}
                          className="mr-2"
                        />
                      </label>
                      <button onClick={handleDeleteSelectedBranches}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={6} />
                ) : branches.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {branchStrings.branch.table.noData}
                    </td>
                  </tr>
                ) : (
                  branches.map((branch, index) => (
                    <tr
                      key={branch.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* Main Data Columns */}
                      {[
                        branch.branchName,
                        branch.branchLocation,
                        branch.company?.organizationName,
                      ].map((field, i) => (
                        <td
                          key={i}
                          className="px-2 py-2 border border-gray-300 break-words align-top"
                        >
                          {field || branchStrings.branch.notAvailable.emptyText}
                        </td>
                      ))}

                      {/* Departments Chip List */}
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                          items={branch.departments || []}
                          labelKey="departmentName"
                          emptyText={
                            branchStrings.branch.notAvailable.emptyText
                          }
                        />
                      </td>

                      {/* Action Buttons */}
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setIsUpdateBranch(true);
                              handlerUpdateData(branch);
                            }}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(branch)}
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
                          checked={selectedBranches.includes(branch.id)}
                          onChange={() =>
                            handleToggleBranchSelection(branch.id)
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
            totalItems={totalBranches}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
            previousLabel={branchStrings.branch.buttons.previous}
            nextLabel={branchStrings.branch.buttons.next}
          />
        </div>
      </div>

      {/* Modals */}
      {isAddBranch && <AddBranch onClose={() => setIsAddBranch(false)} />}
      {isUpdateBranch && (
        <UpdateBranch onClose={() => setIsUpdateBranch(false)} />
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        isSingle={!!branchToDelete}
        count={selectedBranches.length}
        strings={branchStrings.branch}
      />
      {/* Select First Popup */}
      <SelectFirstPopup
        show={showSelectFirstPopup}
        onClose={closeSelectFirstPopup}
        strings={branchStrings.branch}
      />
    </div>
  );
};

export default Branch;

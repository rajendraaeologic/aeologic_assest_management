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
import ChipsList from "../../components/UI/ChipsList";
import branchStrings from "../../locales/branchStrings";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
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
        setDeleteMessage(branchStrings.branch.modals.deleteSuccess.single);
      } else if (selectedBranches.length > 0) {
        // Multiple branches delete
        await dispatch(deleteBranch(selectedBranches)).unwrap();
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
            <table
              className="table-auto min-w-full text-left border-collapse"
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
                    {branchStrings.branch.table.headers.branchName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.branchLocation}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.organizationName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.departmentName}
                  </th>

                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.action}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.deleteAll}
                    <div className="flex justify-center items-center">
                      <div className="">
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
                      </div>
                      <button onClick={handleDeleteSelectedBranches}>
                        <MdDelete className="h-6 w-6  text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {branches.length > 0 ? (
                  branches.map((branch, index) => (
                    <tr
                      key={branch.id || index}
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
                        {branch.branchName}
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
                        {branch.branchLocation}
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
                        {branch.company?.organizationName ||
                          branchStrings.branch.notAvailable.emptyText}
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
                        <ChipsList
                          items={branch.departments || []}
                          labelKey="departmentName"
                          emptyText={
                            branchStrings.branch.notAvailable.emptyText
                          }
                        />
                      </td>

                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{ maxWidth: "100px", wordWrap: "break-word" }}
                      >
                        <div className="flex ">
                          <button
                            onClick={() => {
                              setIsUpdateBranch(true);
                              handlerUpdateData(branch);
                            }}
                            className="px-3 py-2 rounded-sm text-black"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(branch)}
                            className="px-3 py-2 rounded-sm  text-[red]"
                          >
                            <MdDelete className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                      <td
                        className="px-2 py-2 border text-center border-gray-300"
                        style={{ maxWidth: "100px", wordWrap: "break-word" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedBranches?.includes(branch.id) ?? false
                          }
                          onChange={() =>
                            handleToggleBranchSelection(branch.id)
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      {branchStrings.branch.table.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-end mr-4">
            <div className="px-2 py-2 border-2 flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                disabled={currentPage <= 1 || totalPages === 0}
                className={`px-2 py-1 rounded ${
                  currentPage <= 1 || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {branchStrings.branch.buttons.previous}
              </button>

              {/* Page Info */}
              <span className="px-2 space-x-1">
                {totalPages > 0 ? (
                  <>
                    <span className="py-1 px-3 border-2 bg-[#3bc0c3] text-white">
                      {currentPage}
                    </span>
                    <span className="py-1 px-3 border-2 text-gray-500">
                      / {totalPages}
                    </span>
                  </>
                ) : (
                  <span className="py-1 px-3">0 / 0</span>
                )}
              </span>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages || totalPages === 0}
                className={`px-2 py-1 rounded ${
                  currentPage >= totalPages || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {branchStrings.branch.buttons.next}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddBranch && <AddBranch onClose={() => setIsAddBranch(false)} />}
      {isUpdateBranch && (
        <UpdateBranch onClose={() => setIsUpdateBranch(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {branchToDelete
                ? branchStrings.branch.modals.deleteConfirmation.single
                : branchStrings.branch.modals.deleteConfirmation.multiple.replace(
                    "{count}",
                    selectedBranches.length
                  )}
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                {branchStrings.branch.buttons.no}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                disabled={isDeleting}
              >
                {isDeleting
                  ? branchStrings.branch.buttons.deleting
                  : branchStrings.branch.buttons.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select First Popup */}
      {showSelectFirstPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {branchStrings.branch.modals.selectFirst}
            </h3>
            <div className="flex justify-end">
              <button
                onClick={closeSelectFirstPopup}
                className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
              >
                {branchStrings.branch.buttons.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branch;

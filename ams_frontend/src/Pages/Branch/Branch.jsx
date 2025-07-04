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
  setSelectedBranch, resetBranchTableState, resetSelectedBranches,
} from "../../Features/slices/branchSlice";
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
import {toSentenceCase} from "../../utils/string.js";
import {handleReportGeneration} from "../../utils/excelExport.js";
import ReportDialog from "../../components/common/ReportDialog.jsx";
import {getAllAssignAssets} from "../../Features/slices/assignAssetSlice.js";
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


  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
    setLocalSearchTerm(value);
    setIsSearching(value.trim().length > 0);
    debouncedSearch(value);
  };

  useEffect(() => {
    dispatch(setSearchTerm(""));
    setLocalSearchTerm("");
    if (selectedBranches.length > 0) {
      dispatch(deselectAllBranches());
    }
    return () => {
      dispatch(setSearchTerm(""));
      setLocalSearchTerm("");
      dispatch(resetBranchTableState());
      dispatch(resetSelectedBranches());
      dispatch(deselectAllBranches());
      debouncedSearch.cancel();
    };
  }, [dispatch]);

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

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(deselectAllBranches());
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
    setIsDeleting(true);

    try {
      if (branchToDelete) {
        await dispatch(deleteBranch([branchToDelete])).unwrap();
        setDeleteMessage(branchStrings.branch.modals.deleteSuccess.single);
      } else if (selectedBranches.length > 0) {
        await dispatch(deleteBranch(selectedBranches)).unwrap();
        setDeleteMessage(
            branchStrings.branch.modals.deleteSuccess.multiple.replace(
                "{count}",
                selectedBranches.length
            )
        );
      }

      // Refresh data
      dispatch(
          getAllBranches({
            page: currentPage,
            limit: rowsPerPage,
          })
      );

      // Reset state
      dispatch(deselectAllBranches());
      setBranchToDelete(null);
      setShowDeleteConfirmation(false);
      setShowDeleteSuccessPopup(true);

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 2000);
    } catch (error) {
      toast.error(error || "Delete operation failed", {
        position: "top-right",
        autoClose: 2000,
      });

      // Reset on failure
      dispatch(deselectAllBranches());
      setBranchToDelete(null);
      setShowDeleteConfirmation(false);
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

  const handleGenerateReport = async (dateFilters) => {
    setIsExporting(true);

    const success = await handleReportGeneration({
      reportType: dateFilters.reportType,
      dateFilters: {
        selectedDate: dateFilters.selectedDate,
        fromDate: dateFilters.fromDate,
        toDate: dateFilters.toDate,
      },
      endpoint: "/branch/export-excel",
      defaultFileName: "Branch_report",
      successMessage: "Branch report generated successfully",
      errorMessage: "No Branch found matching criteria",
    });

    setIsExporting(false);
    return success;
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
              <button
                  className="px-4 py-2 bg-[#3BC0C3] flex justify-between gap-1 text-white rounded-lg"
                  onClick={() => setShowReportDialog(true)}
              >
                Generate Report
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

            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  {[
                    branchStrings.branch.table.headers.branchName,
                    branchStrings.branch.table.headers.state,
                    branchStrings.branch.table.headers.city,
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
                    <SkeletonLoader rows={5} columns={7} />
                ) : branches.length === 0 ? (
                    <tr>
                      <td
                          colSpan="7"
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
                          <td
                              className="px-2 py-2 border border-gray-300 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap align-top"
                              title={toSentenceCase(branch.branchName)}
                          >
                            {toSentenceCase(branch.branchName) || branchStrings.branch.notAvailable.emptyText}
                          </td>

                          <td
                              className="px-2 py-2 border border-gray-300 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap align-top"
                              title={toSentenceCase(branch.state)}
                          >
                            {toSentenceCase(branch.state) || branchStrings.branch.notAvailable.emptyText}
                          </td>

                          <td
                              className="px-2 py-2 border border-gray-300 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap align-top"
                              title={toSentenceCase(branch.city)}
                          >
                            {toSentenceCase(branch.city) || branchStrings.branch.notAvailable.emptyText}
                          </td>

                          <td
                              className="px-2 py-2 border border-gray-300 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap align-top"
                              title={toSentenceCase(branch.company?.organizationName)}
                          >
                            {toSentenceCase(branch.company?.organizationName) ||
                                branchStrings.branch.notAvailable.emptyText}
                          </td>


                          {/* Departments Chip List */}
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                            items={branch.departments || []}
                            labelKey="departmentName"
                            renderLabel={(dept) => toSentenceCase(dept.departmentName)}
                            emptyText={branchStrings.branch.notAvailable.emptyText}
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
            onPageChange={handlePageChange}
            previousLabel={branchStrings.branch.buttons.previous}
            nextLabel={branchStrings.branch.buttons.next}
          />
        </div>
      </div>

      {/* Modals */}
      <ReportDialog
          show={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          onGenerate={handleGenerateReport}
          isLoading={isExporting}
      />

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

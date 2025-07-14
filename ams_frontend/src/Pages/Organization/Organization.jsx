import React, { useState, useEffect, useContext, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import ChipsList from "../../components/common/UI/ChipsList";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectOrganization,
  selectAllOrganizations,
  deselectAllOrganizations,
  setSelectedOrganization, resetOrgTableState, resetSelectedOrganizations,
} from "../../Features/slices/organizationSlice";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddOrganization from "./AddOrganization";
import UpdateOrganization from "./UpdateOrganization";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import {
  getAllOrganizations,
  setSearchTerm,
} from "../../Features/slices/organizationSlice";
import { deleteOrganization } from "../../Features/slices/organizationSlice";
import organizationStrings from "../../locales/organizationStrings";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader";
import PaginationControls from "../../components/common/PaginationControls";
import SelectFirstPopup from "../../components/common/SelectFirstPopup";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import {toSentenceCase} from "../../utils/string.js";
import {handleReportGeneration} from "../../utils/excelExport.js";
import ReportDialog from "../../components/common/ReportDialog.jsx";

const Organization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { title, breadcrumb, buttons, table, modals, notAvailable } =
    organizationStrings.organization;

  const {
    organizations,
    selectedOrganizations,
    currentPage,
    rowsPerPage,
    totalPages,
    totalOrganizations,
    searchTerm,
    loading,
  } = useSelector((state) => state.organizationData);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddOrganization, setIsAddOrganization] = useState(false);
  const [isUpdateOrganization, setIsUpdateOrganization] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const options = ["5", "10", "25", "50", "100"];


  const debouncedSearch = useCallback(
      debounce((value) => {
        dispatch(setSearchTerm(value));
      }, 500),
      [dispatch]
  );

  useEffect(() => {
    dispatch(setSearchTerm(""));
    setLocalSearchTerm("");
    if (selectedOrganizations.length > 0) {
      dispatch(deselectAllOrganizations());
    }
    return () => {
      dispatch(setSearchTerm(""));
      setLocalSearchTerm("");
      dispatch(resetOrgTableState());
      dispatch(deselectAllOrganizations());
    };
  }, [dispatch]);

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
      getAllOrganizations({
        page: currentPage,
        limit: rowsPerPage,
        searchTerm: searchTerm.trim(),
      })
    );
  }, [dispatch, currentPage, rowsPerPage, searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
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

  const handleDeleteSelectedOrganizations = () => {
    if (selectedOrganizations.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleSelectAllOrganizations = (e) => {
    if (e.target.checked) {
      dispatch(selectAllOrganizations());
    } else {
      dispatch(deselectAllOrganizations());
    }
  };
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(deselectAllOrganizations());
  };
  const handleToggleOrganizationSelection = (id) => {
    dispatch(toggleSelectOrganization(id));
  };

  const handlerUpdateData = (org) => {
    dispatch(setSelectedOrganization(org));
  };

  const handleDeleteClick = (org) => {
    setOrganizationToDelete(org.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (organizationToDelete) {
        await dispatch(deleteOrganization([organizationToDelete])).unwrap();
        setDeleteMessage(modals.deleteSuccess.single);
      } else if (selectedOrganizations.length > 0) {
        await dispatch(deleteOrganization(selectedOrganizations)).unwrap();
        setDeleteMessage(
          modals.deleteSuccess.multiple.replace(
            "{count}",
            selectedOrganizations.length
          )
        );
      }

      // Reset selections after successful delete
      dispatch(deselectAllOrganizations());
      setOrganizationToDelete(null);
      setShowDeleteConfirmation(false);
      setShowDeleteSuccessPopup(true);

      // Refresh data
      dispatch(
          getAllOrganizations({
            page: currentPage,
            limit: rowsPerPage,
          })
      );

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 2000);
    } catch (error) {
      toast.error(error || "Delete operation failed", {
        position: "top-right",
        autoClose: 2000,
      });
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
    setOrganizationToDelete(null);
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
      endpoint: "/organization/export-excel",
      defaultFileName: "organizations_report",
      successMessage: "Organizations report generated successfully",
      errorMessage: "No organizations found matching criteria",
    });

    setIsExporting(false);
    return success;
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
            <h3 className="text-xl font-semibold text-[#6c757D]">{title}</h3>
            <div className="flex gap-3 md:mr-8">
              <button
                  className="px-4 py-2 bg-[#3BC0C3] flex justify-between gap-1 text-white rounded-lg"
                  onClick={() => setShowReportDialog(true)}
              >
                Generate Report
              </button>
              <button
                onClick={() => setIsAddOrganization(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {buttons.addOrganization}
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D] ">
              {breadcrumb.dashboard}
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">{breadcrumb.organization}</p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
              <p>{table.showEntries}</p>
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
              <p>{table.entries}</p>
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
                    table.headers.orgName,
                    table.headers.branchName,
                    table.headers.state,
                    table.headers.city,
                    table.headers.departmentName,
                    table.headers.action,
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 border border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}

                  <th className="px-2 py-2 border border-gray-300 min-w-[100px] max-w-[100px] whitespace-nowrap">
                    {table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedOrganizations.length ===
                              organizations.length && organizations.length > 0
                          }
                          onChange={handleSelectAllOrganizations}
                          className="mr-2"
                        />
                      </label>
                      <button onClick={handleDeleteSelectedOrganizations}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={7} />
                ) : organizations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {table.noData}
                    </td>
                  </tr>
                ) : (
                  organizations.map((org, index) => (
                    <tr
                      key={org.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* Organization Name */}
                      <td
                          className="px-2 py-2 border border-gray-300 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap align-top"
                          title={toSentenceCase(org.organizationName)}
                      >
                        {toSentenceCase(org.organizationName) || notAvailable.emptyText}
                      </td>


                      {/* Branches Chip List */}
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                          items={org.branches}
                          labelKey="branchName"
                          emptyText={notAvailable.emptyText}
                        />
                      </td>

                      {/* Branch Locations Chip List */}
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                          items={org.branches}
                          labelKey="state"
                          emptyText={notAvailable.emptyText}
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                            items={org.branches}
                            labelKey="city"
                            emptyText={notAvailable.emptyText}
                        />
                      </td>


                      {/* Departments Chip List */}
                      <td className="px-2 py-2 border border-gray-300 break-words align-top">
                        <ChipsList
                            items={
                                org.branches?.flatMap(
                                    (branch) => branch.departments || []
                                ) || []
                            }
                            labelKey="departmentName"
                            renderLabel={(dept) => toSentenceCase(dept.departmentName)}
                            emptyText={notAvailable.emptyText}
                        />
                      </td>

                      {/* Action Buttons */}
                      <td className="px-2 py-2 border border-gray-300 text-center align-top">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setIsUpdateOrganization(true);
                              handlerUpdateData(org);
                            }}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(org)}
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
                          checked={selectedOrganizations.includes(org.id)}
                          onChange={() =>
                            handleToggleOrganizationSelection(org.id)
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
            totalItems={totalOrganizations}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
            onPageChange={handlePageChange}
            previousLabel={buttons.previous}
            nextLabel={buttons.next}
            disabled={loading}
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

      {isAddOrganization && (
        <AddOrganization onClose={() => setIsAddOrganization(false)} />
      )}
      {isUpdateOrganization && (
        <UpdateOrganization onClose={() => setIsUpdateOrganization(false)} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        isSingle={!!organizationToDelete}
        count={selectedOrganizations.length}
        strings={organizationStrings.organization}
      />
      {/* Select First Popup */}
      <SelectFirstPopup
        show={showSelectFirstPopup}
        onClose={closeSelectFirstPopup}
        strings={organizationStrings.organization}
      />
    </div>
  );
};

export default Organization;

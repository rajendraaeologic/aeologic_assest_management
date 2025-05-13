import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectAssignAsset,
  selectAllAssignAssets,
  deselectAllAssignAssets,
  setSelectedAssignAsset,
} from "../../Features/slices/assignAssetSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddAssignAsset from "./AddAssignAsset";
import UpdateAssignAsset from "./UpdateAssignAsset";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import {
  getAllAssignAssets,
  setSearchTerm,
} from "../../Features/slices/assignAssetSlice";
import { deleteAssignAsset } from "../../Features/slices/assignAssetSlice";
import assignAssetStrings from "../../locales/assignAssetString";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import SkeletonLoader from "../../components/SkeletonLoader/SkeletonLoader";
const AssignAsset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { title, breadcrumb, buttons, table, modals } =
    assignAssetStrings.assignAsset;

  const {
    assignAssets,
    selectedAssignAssets,
    currentPage,
    rowsPerPage,
    totalAssignPages,
    totalAssignAssets,
    searchTerm,
    loading,
    error,
  } = useSelector((state) => state.assignAssetData);

  const [isAddAssignAsset, setIsAddAssignAsset] = useState(false);
  const [isUpdateAssignAsset, setIsUpdateAssignAsset] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assignAssetToDelete, setAssignAssetToDelete] = useState(null);
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
      getAllAssignAssets({
        page: currentPage,
        limit: rowsPerPage,
        status: "IN_USE",
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

  const handleDeleteSelectedAssignAssets = () => {
    if (selectedAssignAssets.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleSelectAllAssignAssets = (e) => {
    if (e.target.checked) {
      dispatch(selectAllAssignAssets());
    } else {
      dispatch(deselectAllAssignAssets());
    }
  };

  const handleToggleAssignAssetSelection = (id) => {
    dispatch(toggleSelectAssignAsset(id));
  };

  const handlerUpdateData = (asset) => {
    dispatch(setSelectedAssignAsset(asset));
  };

  const handleDeleteClick = (asset) => {
    setAssignAssetToDelete(asset.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (assignAssetToDelete) {
        await dispatch(deleteAssignAsset([assignAssetToDelete])).unwrap();
        setDeleteMessage(modals.deleteSuccess.single);
      } else if (selectedAssignAssets.length > 0) {
        await dispatch(deleteAssignAsset(selectedAssignAssets)).unwrap();
        setDeleteMessage(
          modals.deleteSuccess.multiple.replace(
            "{count}",
            selectedAssignAssets.length
          )
        );
      }

      setShowDeleteConfirmation(false);
      setAssignAssetToDelete(null);
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
    setAssignAssetToDelete(null);
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
            <h3 className="text-xl font-semibold text-[#6c757D]">{title}</h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddAssignAsset(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {buttons.addAssignAsset}
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
            <p className="text-[#6c757D]">{breadcrumb.assignAsset}</p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
              <p>{assignAssetStrings.assignAsset.table.showEntries}</p>
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
              <p>{assignAssetStrings.assignAsset.table.entries}</p>
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
                  {[
                    table.headers.assetName,
                    table.headers.userName,
                    table.headers.organizationName,
                    table.headers.branchName,
                    table.headers.departmentName,
                    table.headers.action,
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 border border-gray-300"
                      style={{
                        maxWidth: idx === 5 || idx === 6 ? "100px" : "auto",
                        minWidth: idx === 5 || idx === 6 ? "100px" : "120px",
                        overflowWrap: "break-word",
                      }}
                    >
                      {header}
                    </th>
                  ))}

                  {/* Delete All Column */}
                  <th
                    className="px-2 py-2 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedAssignAssets.length ===
                              assignAssets.length && assignAssets.length > 0
                          }
                          onChange={handleSelectAllAssignAssets}
                          className="mr-2"
                        />
                      </label>
                      <button onClick={handleDeleteSelectedAssignAssets}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={7} />
                ) : error ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-2 py-4 text-center text-red-500 border border-gray-300"
                    >
                      {error}
                    </td>
                  </tr>
                ) : assignAssets.length > 0 ? (
                  assignAssets.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* Asset Name */}
                      <td className="px-2 py-2 border border-gray-300">
                        {row.asset?.assetName ?? "N/A"}
                      </td>

                      {/* User Name */}
                      <td className="px-2 py-2 border border-gray-300">
                        {row.user?.userName ?? "N/A"}
                      </td>

                      {/* Organization */}
                      <td className="px-2 py-2 border border-gray-300">
                        {row.user?.company?.organizationName ?? "N/A"}
                      </td>

                      {/* Branch */}
                      <td className="px-2 py-2 border border-gray-300">
                        {row.user?.branch?.branchName ?? "N/A"}
                      </td>

                      {/* Department */}
                      <td className="px-2 py-2 border border-gray-300">
                        {row.user?.department?.departmentName ?? "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2 border border-gray-300">
                        <div className="flex">
                          <button
                            onClick={() => {
                              setIsUpdateAssignAsset(true);
                              handlerUpdateData(row);
                            }}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="px-3 py-2 rounded-sm text-[red]"
                          >
                            <MdDelete className="h-6 w-6" />
                          </button>
                        </div>
                      </td>

                      {/* Checkbox */}
                      <td className="px-2 py-2 border text-center border-gray-300">
                        <input
                          type="checkbox"
                          checked={
                            selectedAssignAssets?.includes(row.id) ?? false
                          }
                          onChange={() =>
                            handleToggleAssignAssetSelection(row.id)
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-4 text-center text-black"
                    >
                      {table.noData}
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
                disabled={currentPage <= 1 || totalAssignPages === 0}
                className={`px-2 py-1 rounded ${
                  currentPage <= 1 || totalAssignPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {assignAssetStrings.assignAsset.buttons.previous}
              </button>

              {/* Page Info */}
              <span className="px-2 space-x-1">
                {totalAssignPages > 0 ? (
                  <>
                    <span className="py-1 px-3 border-2 bg-[#3bc0c3] text-white">
                      {currentPage}
                    </span>
                    <span className="py-1 px-3 border-2 text-gray-500">
                      / {totalAssignPages}
                    </span>
                  </>
                ) : (
                  <span className="py-1 px-3">0 / 0</span>
                )}
              </span>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={
                  currentPage >= totalAssignPages || totalAssignPages === 0
                }
                className={`px-2 py-1 rounded ${
                  currentPage >= totalAssignPages || totalAssignPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {assignAssetStrings.assignAsset.buttons.next}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      {isAddAssignAsset && (
        <AddAssignAsset onClose={() => setIsAddAssignAsset(false)} />
      )}
      {isUpdateAssignAsset && (
        <UpdateAssignAsset onClose={() => setIsUpdateAssignAsset(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {assignAssetToDelete
                ? modals.deleteConfirmation.single
                : modals.deleteConfirmation.multiple.replace(
                    "{count}",
                    selectedAssignAssets.length
                  )}
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                {buttons.no}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                disabled={isDeleting}
              >
                {isDeleting ? buttons.deleting : buttons.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select First Popup */}
      {showSelectFirstPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{modals.selectFirst}</h3>
            <div className="flex justify-end">
              <button
                onClick={closeSelectFirstPopup}
                className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
              >
                {buttons.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignAsset;

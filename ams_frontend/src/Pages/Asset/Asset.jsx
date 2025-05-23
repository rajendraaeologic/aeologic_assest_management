import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectAsset,
  selectAllAssets,
  deselectAllAssets,
  setSelectedAsset, resetAssetTableState,
} from "../../Features/slices/assetSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddAsset from "./AddAsset";
import UpdateAsset from "./UpdateAsset";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllAssets, setSearchTerm } from "../../Features/slices/assetSlice";
import { deleteAsset } from "../../Features/slices/assetSlice";
import assetStrings from "../../locales/assetStrings";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader";
import PaginationControls from "../../components/common/PaginationControls";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import SelectFirstPopup from "../../components/common/SelectFirstPopup";
import {resetDeptTableState} from "../../Features/slices/departmentSlice.js";
const Asset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);
  const strings = assetStrings.asset;

  const {
    assets,
    selectedAssets,
    currentPage,
    rowsPerPage,
    totalPages,
    totalAssets,
    searchTerm,
    loading,
    error,
  } = useSelector((state) => state.assetUserData);

  const [isAddAsset, setIsAddAsset] = useState(false);
  const [isUpdateAsset, setIsUpdateAsset] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
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
    dispatch(setSearchTerm(""));
    setLocalSearchTerm("");
    return () => {
      dispatch(setSearchTerm(""));
      setLocalSearchTerm("");
      dispatch(resetAssetTableState());
    };
  }, [dispatch]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Fetch users when page, limit, or searchTerm changes
  useEffect(() => {
    dispatch(
      getAllAssets({
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
  const handleDeleteSelectedAssets = () => {
    if (selectedAssets.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleSelectAllAssets = (e) => {
    if (e.target.checked) {
      dispatch(selectAllAssets());
    } else {
      dispatch(deselectAllAssets());
    }
  };

  const handleToggleAssetSelection = (id) => {
    dispatch(toggleSelectAsset(id));
  };

  const handleEditAsset = (asset) => {
    dispatch(setSelectedAsset(asset));
    setIsUpdateAsset(true);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (assetToDelete) {
        await dispatch(deleteAsset([assetToDelete])).unwrap();
        dispatch(
          getAllAssets({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(strings.modals.deleteSuccess.single);
      } else if (selectedAssets.length > 0) {
        await dispatch(deleteAsset(selectedAssets)).unwrap();
        dispatch(
          getAllAssets({
            page: currentPage,
            limit: rowsPerPage,
          })
        );
        setDeleteMessage(
          strings.modals.deleteSuccess.multiple.replace(
            "{count}",
            selectedAssets.length
          )
        );
      }

      setShowDeleteConfirmation(false);
      setAssetToDelete(null);
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
    setAssetToDelete(null);
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
              {strings.title}
            </h3>
            <div className="flex gap-3 md:mr-8">
              <button
                onClick={() => setIsAddAsset(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {strings.buttons.addAsset}
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D]">
              {strings.breadcrumb.dashboard}
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">{strings.breadcrumb.asset}</p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center justify-between pt-8 px-6">
            {/* Left side: Show entries dropdown */}
            <div className="flex items-center gap-2">
              <p>{assetStrings.asset.table.showEntries}</p>
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
              <p>{assetStrings.asset.table.entries}</p>
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
                    strings.table.headers.assetName,
                    strings.table.headers.uniqueId,
                    strings.table.headers.brand,
                    strings.table.headers.model,
                    strings.table.headers.serialNumber,
                    strings.table.headers.status,
                    strings.table.headers.organizationName,
                    strings.table.headers.branch,
                    strings.table.headers.department,
                    strings.table.headers.action,
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
                    {strings.table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedAssets.length === assets.length &&
                            assets.length > 0
                          }
                          onChange={handleSelectAllAssets}
                          className="mr-2"
                        />
                      </label>
                      <button onClick={handleDeleteSelectedAssets}>
                        <MdDelete className="h-5 w-5 text-[red]" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={11} />
                ) : assets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {strings.table.noData}
                    </td>
                  </tr>
                ) : (
                  assets.map((asset, index) => (
                    <tr
                      key={asset.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 divide-y divide-gray-300`}
                    >
                      {/* Asset Columns */}
                      {[
                        asset.assetName,
                        asset.uniqueId,
                        asset.brand,
                        asset.model,
                        asset.serialNumber,
                        asset.status,
                        asset.company?.organizationName,
                        asset.branch?.branchName,
                        asset.department?.departmentName,
                      ].map((field, i) => (
                        <td
                          key={i}
                          className="px-2 py-2 border border-gray-300 break-words align-top"
                        >
                          {field || strings.notAvailable.emptyText}
                        </td>
                      ))}

                      {/* Action Buttons */}
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="px-3 py-2 rounded-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(asset)}
                            className="px-3 py-2 rounded-sm text-[red]"
                          >
                            <MdDelete className="h-6 w-6" />
                          </button>
                        </div>
                      </td>

                      {/* Checkbox Selection */}
                      <td className="px-2 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => handleToggleAssetSelection(asset.id)}
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
            totalItems={totalAssets}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
            onPageChange={handlePageChange}
            previousLabel={strings.buttons.previous}
            nextLabel={strings.buttons.next}
          />
        </div>
      </div>
      {/* Modals */}
      {isAddAsset && (
        <AddAsset
          onClose={() => setIsAddAsset(false)}
          onSuccess={() => dispatch(getAllAssets())}
        />
      )}
      {isUpdateAsset && (
        <UpdateAsset
          onClose={() => setIsUpdateAsset(false)}
          onSuccess={() => dispatch(getAllAssets())}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        isSingle={!!assetToDelete}
        count={selectedAssets.length}
        strings={assetStrings.asset}
      />
      {/* Select First Popup */}
      <SelectFirstPopup
        show={showSelectFirstPopup}
        onClose={closeSelectFirstPopup}
        strings={assetStrings.asset}
      />
    </div>
  );
};

export default Asset;

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
  setSelectedAsset,
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
import SkeletonLoader from "../../components/SkeletonLoader/SkeletonLoader";
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

  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (assetToDelete) {
        await dispatch(deleteAsset([assetToDelete])).unwrap();
        setDeleteMessage(strings.modals.deleteSuccess.single);
      } else if (selectedAssets.length > 0) {
        await dispatch(deleteAsset(selectedAssets)).unwrap();
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
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
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
            <table
              className="table-auto min-w-full text-left border-collapse"
              style={{ tableLayout: "fixed" }}
            >
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
                      className="px-2 py-2 border border-gray-300"
                      style={{
                        maxWidth: idx === 9 || idx === 10 ? "100px" : "auto",
                        minWidth: idx === 9 || idx === 10 ? "100px" : "165px",
                        overflowWrap: "break-word",
                      }}
                    >
                      {header}
                    </th>
                  ))}

                  <th
                    className="px-2 py-2 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.deleteAll}
                    <div className="flex justify-center items-center gap-1">
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

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <SkeletonLoader rows={5} columns={11} />
                ) : error ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-2 py-4 text-center text-red-500 border border-gray-300"
                    >
                      {error}
                    </td>
                  </tr>
                ) : assets.length > 0 ? (
                  assets.map((asset, index) => (
                    <tr
                      key={asset.id || index}
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
                        }}
                      >
                        {asset.assetName || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.uniqueId || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.brand || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.model || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.serialNumber || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.status || strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.company?.organizationName ||
                          strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.branch?.branchName || strings.table.notAvailable}
                      </td>

                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.department?.departmentName ||
                          strings.table.notAvailable}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{ maxWidth: "100px", wordWrap: "break-word" }}
                      >
                        <div className="flex ">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="px-3 py-2 rounded-sm "
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
                      <td
                        className="px-2 py-2 border text-center border-gray-300"
                        style={{ maxWidth: "100px", wordWrap: "break-word" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssets?.includes(asset.id) ?? false}
                          onChange={() => handleToggleAssetSelection(asset.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-2 py-4 text-center border border-gray-300"
                    >
                      {strings.table.noData}
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
                {assetStrings.asset.buttons.previous}
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
                {assetStrings.asset.buttons.next}
              </button>
            </div>
          </div>
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
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {assetToDelete
                ? strings.modals.deleteConfirmation.single
                : strings.modals.deleteConfirmation.multiple.replace(
                    "{count}",
                    selectedAssets.length
                  )}
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                {strings.buttons.no}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                disabled={isDeleting}
              >
                {/* {strings.buttons.yes} */}
                {isDeleting ? strings.buttons.deleting : strings.buttons.yes}
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
              {strings.modals.selectFirst}
            </h3>
            <div className="flex justify-end">
              <button
                onClick={closeSelectFirstPopup}
                className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
              >
                {strings.buttons.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asset;

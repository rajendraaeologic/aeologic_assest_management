import React, { useState, useEffect, useContext } from "react";
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
import { getAllAssets } from "../../Features/slices/assetSlice";
import { deleteAsset } from "../../Features/slices/assetSlice";
import assetStrings from "../../locales/assetStrings";

const Asset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);
  const strings = assetStrings.asset;

  const { assets, selectedAssets, currentPage, rowsPerPage } = useSelector(
    (state) => state.assetUserData
  );

  useEffect(() => {
    dispatch(getAllAssets());
  }, [dispatch]);

  const [isAddAsset, setIsAddAsset] = useState(false);
  const [isUpdateAsset, setIsUpdateAsset] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(assets.length / rowsPerPage);

  const [searchAsset, setSearchAsset] = useState({
    assetName: "",
    uniqueId: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "",
    branch: "",
    department: "",
    organizationName: "",
  });

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
    setSearchAsset((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredAssets = assets?.filter((asset) => {
    return Object.entries(searchAsset).every(([key, searchValue]) => {
      if (key === "branch" && asset.branch) {
        return asset.branch.branchName
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      }
      if (key === "department" && asset.department) {
        return asset.department.departmentName
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      }

      return (asset[key] || "")
        .toString()
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredAssets.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleNavigate = () => {
    navigate("/dashboard");
  };

  const handlePrev = () => {
    if (currentPage > 0) dispatch(setCurrentPage(currentPage - 1));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) dispatch(setCurrentPage(currentPage + 1));
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

  const confirmDelete = () => {
    if (assetToDelete) {
      dispatch(deleteAsset([assetToDelete]));
      setDeleteMessage(strings.modals.deleteSuccess.single);
    } else if (selectedAssets.length > 0) {
      dispatch(deleteAsset(selectedAssets));
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
  };

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
          <div className="flex items-center gap-2 pt-8 ml-3">
            <p>{strings.table.showEntries}</p>
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
            <p>{strings.table.entries}</p>
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
                    {strings.table.headers.assetName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.uniqueId}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.brand}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.model}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.serialNumber}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.status}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.organizationName}
                  </th>

                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.branch}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.department}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.action}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {strings.table.headers.deleteAll}
                  </th>
                </tr>
              </thead>

              {/* Search Row */}
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
                      name="assetName"
                      placeholder={strings.table.searchPlaceholders.assetName}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.assetName}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="uniqueId"
                      placeholder={strings.table.searchPlaceholders.uniqueId}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.uniqueId}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="brand"
                      placeholder={strings.table.searchPlaceholders.brand}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.brand}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="model"
                      placeholder={strings.table.searchPlaceholders.model}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.model}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="serialNumber"
                      placeholder={
                        strings.table.searchPlaceholders.serialNumber
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.serialNumber}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      placeholder={strings.table.searchPlaceholders.status}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.status}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="branch"
                      placeholder={
                        strings.table.searchPlaceholders.organizationName
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.organizationName}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="branch"
                      placeholder={strings.table.searchPlaceholders.branch}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.branch}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                      name="department"
                      placeholder={strings.table.searchPlaceholders.department}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.department}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
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
                              selectedAssets.length === assets.length &&
                              assets.length > 0
                            }
                            onChange={handleSelectAllAssets}
                            className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedAssets}>
                        <MdDelete className="h-6 w-6 text-[red]" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((asset, index) => (
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
                        {asset.assetName}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.uniqueId}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.brand}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.model}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.serialNumber}
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{
                          maxWidth: "180px",
                          minWidth: "120px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.status}
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
              <button
                onClick={handlePrev}
                disabled={currentPage === 0 || totalPages === 0}
                className={`${
                  currentPage === 0 || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {assetStrings.asset.buttons.previous}
              </button>

              <span className="px-2 space-x-1">
                {totalPages > 0 ? (
                  <>
                    <span
                      className={`py-1 px-3 ${
                        currentPage + 1 < totalPages
                          ? "bg-[#3bc0c3] text-white"
                          : "border-2"
                      }`}
                    >
                      {currentPage + 1}
                    </span>
                    <span
                      className={`py-1 px-3 ${
                        currentPage + 1 === totalPages
                          ? "bg-[#3bc0c3] text-white"
                          : "border-2"
                      }`}
                    >
                      {totalPages}
                    </span>
                  </>
                ) : (
                  <span className="py-1 px-3">0 / 0</span>
                )}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage + 1 >= totalPages || totalPages === 0}
                className={`${
                  currentPage + 1 >= totalPages
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
              >
                {strings.buttons.yes}
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

      {/* Delete Success Popup */}
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

export default Asset;

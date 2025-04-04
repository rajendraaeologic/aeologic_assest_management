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

const Asset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { assets, selectedAssets, currentPage, rowsPerPage } =
    useSelector((state) => state.assetUserData);

  useEffect(() => {
    dispatch(getAllAssets());
  }, [dispatch]);

  const [isAddAsset, setIsAddAsset] = useState(false);
  const [isUpdateAsset, setIsUpdateAsset] = useState(false);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(assets.length / rowsPerPage);

  const [searchAsset, setSearchAsset] = useState({
    assetName: "",
    uniqueId: "",
    description: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "",
    assignedUser: "",
    assetLocation: "",
    branch: "",
    department: ""
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchAsset((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredAssets = assets?.filter((asset) => {
    return Object.entries(searchAsset).every(([key, searchValue]) => {
      // Handle nested object searches
      if (key === "assignedUser" && asset.assignedUser) {
        return asset.assignedUser.userName?.toLowerCase().includes(searchValue.toLowerCase());
      }
      if (key === "assetLocation" && asset.assetLocation) {
        return asset.assetLocation.locationName.toLowerCase().includes(searchValue.toLowerCase());
      }
      if (key === "branch" && asset.branch) {
        return asset.branch.branchName.toLowerCase().includes(searchValue.toLowerCase());
      }
      if (key === "department" && asset.department) {
        return asset.department.departmentName.toLowerCase().includes(searchValue.toLowerCase());
      }
      
      // Handle direct property searches
      return (asset[key] || "").toString().toLowerCase().includes(searchValue.toLowerCase());
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
    if (selectedAssets.length > 0) {
      dispatch(deleteAsset(selectedAssets));
    }
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

  return (
    <div
      className={`w-full min-h-screen bg-slate-100 px-2 ${
        isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
      }`}
    >
      <div
        className={`mx-auto min-h-screen ${
          isSidebarOpen
            ? "lg:w-[78%] md:ml-[260px] md:w-[65%]"
            : "lg:w-[90%] md:ml-[100px]"
        }`}
      >
        <div className="pt-24">
          <div className="flex justify-between mx-5 mt-2">
            <h3 className="text-xl font-semibold text-[#6c757D]">Asset List</h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddAsset(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                Add Asset
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D]">
              Dashboard
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">Asset</p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center gap-2 pt-8 ml-3">
            <p>Show</p>
            <div className="border-2 flex justify-evenly">
              <select
                value={rowsPerPage}
                onChange={(e) => dispatch(setRowsPerPage(parseInt(e.target.value)))}
                className="outline-none px-6"
              >
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <p>Entries</p>
          </div>

          <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
            <table
              className="table-auto min-w-max text-left border-collapse"
              style={{ tableLayout: "fixed" }}
            >
              <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 border border-gray-300">Asset Name</th>
                  <th className="px-4 py-4 border border-gray-300">Unique ID</th>
                  <th className="px-4 py-4 border border-gray-300">Brand</th>
                  <th className="px-4 py-4 border border-gray-300">Model</th>
                  <th className="px-4 py-4 border border-gray-300">Serial Number</th>
                  <th className="px-4 py-4 border border-gray-300">Status</th>
                  <th className="px-4 py-4 border border-gray-300">Assigned To</th>
                  <th className="px-4 py-4 border border-gray-300">Location</th>
                  <th className="px-4 py-4 border border-gray-300">Branch</th>
                  <th className="px-4 py-4 border border-gray-300">Department</th>
                  <th className="px-4 py-4 border border-gray-300">Action</th>
                  <th className="px-4 py-4 border border-gray-300">
                    <div className="flex justify-center items-center">
                      <div className="">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedAssets.length === assets.length && assets.length > 0
                            }
                            onChange={handleSelectAllAssets}
                            className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedAssets}>
                        <MdDelete className="h-6 w-6" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Search Row */}
              <tbody>
                <tr className="bg-gray-100">
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="assetName"
                      placeholder="Asset Name"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.assetName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="uniqueId"
                      placeholder="Unique ID"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.uniqueId}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="brand"
                      placeholder="Brand"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.brand}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="model"
                      placeholder="Model"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.model}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="serialNumber"
                      placeholder="Serial Number"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.serialNumber}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="status"
                      placeholder="Status"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.status}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="assignedUser"
                      placeholder="Assigned To"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.assignedUser}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="assetLocation"
                      placeholder="Location"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.assetLocation}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="branch"
                      placeholder="Branch"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.branch}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="department"
                      placeholder="Department"
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchAsset.department}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.map((asset, index) => (
                  <tr
                    key={asset.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200 divide-y divide-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.assetName}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.uniqueId}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.brand}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.model}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.serialNumber}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.status}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.assignedUser?.userName || "Unassigned"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.assetLocation?.locationName || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.branch?.branchName || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {asset.department?.departmentName || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => handleEditAsset(asset)}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedAssets?.includes(asset.id) ?? false}
                        onChange={() => handleToggleAssetSelection(asset.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-end mr-4">
            <div className="px-2 py-2 border-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="text-black"
              >
                Previous
              </button>
              <span className="px-2 space-x-1">
                <span
                  className={`${
                    currentPage === 0
                      ? "bg-[#3bc0c3] py-1 px-3"
                      : "border-2 py-1 px-3"
                  }`}
                >
                  {currentPage + 1}
                </span>
                <span
                  className={`${
                    currentPage + 1 === totalPages
                      ? "py-1 px-3 bg-[#3bc0c3]"
                      : "py-1 px-3"
                  }`}
                >
                  {totalPages}
                </span>
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage + 1 === totalPages}
                className="text-black"
              >
                Next
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
    </div>
  );
};

export default Asset;
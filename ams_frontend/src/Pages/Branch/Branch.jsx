import React, { useState, useEffect, useContext } from "react";
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
import { getAllBranches } from "../../Features/slices/branchSlice";
import { deleteBranch } from "../../Features/slices/branchSlice";

const Branch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { branches, selectedBranches, currentPage, rowsPerPage } = useSelector(
    (state) => state.branchData
  );

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch, branches.length]);

  const [isAddBranch, setIsAddBranch] = useState(false);
  const [isUpdateBranch, setIsUpdateBranch] = useState(false);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(branches.length / rowsPerPage);

  const [searchBranch, setSearchBranch] = useState({
    branchName: "",
    branchLocation: "",
    organizationName: "",
    departmentName: "",
    userName: "",
    assetName: "",
    status: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchBranch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredBranches = branches?.filter((branch) => {
    return (
      (searchBranch.branchName === "" ||
        (branch.branchName || "")
          .toLowerCase()
          .includes(searchBranch.branchName.toLowerCase())) &&
      (searchBranch.branchLocation === "" ||
        (branch.branchLocation || "")
          .toLowerCase()
          .includes(searchBranch.branchLocation.toLowerCase())) &&
      (searchBranch.organizationName === "" ||
        (branch.company?.organizationName || "")
          .toLowerCase()
          .includes(searchBranch.organizationName.toLowerCase())) &&
      (searchBranch.departmentName === "" ||
        branch.departments?.some((dept) =>
          dept.departmentName
            .toLowerCase()
            .includes(searchBranch.departmentName.toLowerCase())
        ) ||
        false) &&
      (searchBranch.userName === "" ||
        branch.users?.some((user) =>
          user.userName
            .toLowerCase()
            .includes(searchBranch.userName.toLowerCase())
        ) ||
        false) &&
      (searchBranch.assetName === "" ||
        branch.assets?.some((asset) =>
          asset.assetName
            .toLowerCase()
            .includes(searchBranch.assetName.toLowerCase())
        ) ||
        false) &&
      (searchBranch.status === "" ||
        branch.assets?.some((asset) =>
          asset.status.toLowerCase().includes(searchBranch.status.toLowerCase())
        ) ||
        false)
    );
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredBranches.slice(
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

  const handleDeleteSelectedBranches = () => {
    dispatch(deleteBranch(selectedBranches));
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
            <h3 className="text-xl font-semibold text-[#6c757D]">
              Branch List
            </h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddBranch(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                Add Branch
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
            <p className="text-[#6c757D]">Branch</p>
          </div>
        </div>

        <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex items-center gap-2 pt-8 ml-3">
            <p>Show</p>
            <div className="border-2 flex justify-evenly">
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  dispatch(setRowsPerPage(parseInt(e.target.value)))
                }
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
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Location
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Organization Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Department Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    User Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[100px]">
                    Asset Status
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[100px]">
                    Action
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[100px]">
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
                      name="branchName"
                      placeholder="Branch Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.branchName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="branchLocation"
                      placeholder="Branch Location"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.branchLocation}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="organizationName"
                      placeholder="Organization Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.organizationName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="departmentName"
                      placeholder="Department Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.departmentName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="userName"
                      placeholder="User Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.userName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="assetName"
                      placeholder="Asset Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.assetName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="status"
                      placeholder="Asset Status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.status}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.map((branch, index) => (
                  <tr
                    key={branch.id || index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200 divide-y divide-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.branchName}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.branchLocation}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.company?.organizationName || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.departments
                        ?.map((dept) => dept.departmentName)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.users?.map((user) => user.userName).join(", ") ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.assets
                        ?.map((asset) => asset.assetName)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {branch.assets?.map((asset) => asset.status).join(", ") ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => {
                          setIsUpdateBranch(true);
                          handlerUpdateData(branch);
                        }}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedBranches?.includes(branch.id) ?? false}
                        onChange={() => handleToggleBranchSelection(branch.id)}
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

      {isAddBranch && <AddBranch onClose={() => setIsAddBranch(false)} />}
      {isUpdateBranch && (
        <UpdateBranch onClose={() => setIsUpdateBranch(false)} />
      )}
    </div>
  );
};

export default Branch;

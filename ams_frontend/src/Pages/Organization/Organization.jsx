import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import ChipsList from "../../components/UI/ChipsList";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectOrganization,
  selectAllOrganizations,
  deselectAllOrganizations,
  setSelectedOrganization,
} from "../../Features/slices/organizationSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddOrganization from "./AddOrganization";
import UpdateOrganization from "./UpdateOrganization";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import { deleteOrganization } from "../../Features/slices/organizationSlice";

const Organization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { organizations, selectedOrganizations, currentPage, rowsPerPage } =
    useSelector((state) => state.organizationData);

  useEffect(() => {
    dispatch(getAllOrganizations());
  }, [dispatch, organizations.length]);

  const [isAddOrganization, setIsAddOrganization] = useState(false);
  const [isUpdateOrganization, setIsUpdateOrganization] = useState(false);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(organizations.length / rowsPerPage);

  const [searchOrganization, setSearchOrganization] = useState({
    organizationName: "",
    branchName: "",
    branchLocation: "",
    departmentName: "",
    userName: "",
    assetName: "",
    status: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchOrganization((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredOrganizations = organizations?.filter((org) => {
    return (
      (searchOrganization.organizationName === "" ||
        (org.organizationName || "")
          .toLowerCase()
          .includes(searchOrganization.organizationName.toLowerCase())) &&
      (searchOrganization.branchName === "" ||
        org.branches?.some((branch) =>
          branch.branchName
            .toLowerCase()
            .includes(searchOrganization.branchName.toLowerCase())
        ) ||
        false) &&
      (searchOrganization.branchLocation === "" ||
        org.branches?.some((branch) =>
          branch.branchLocation
            .toLowerCase()
            .includes(searchOrganization.branchLocation.toLowerCase())
        ) ||
        false) &&
      (searchOrganization.departmentName === "" ||
        org.branches?.some((branch) =>
          branch.departments?.some((dept) =>
            dept.departmentName
              .toLowerCase()
              .includes(searchOrganization.departmentName.toLowerCase())
          )
        ) ||
        false) &&
      (searchOrganization.userName === "" ||
        org.branches?.some((branch) =>
          branch.users?.some((user) =>
            user.userName
              .toLowerCase()
              .includes(searchOrganization.userName.toLowerCase())
          )
        ) ||
        false) &&
      (searchOrganization.assetName === "" ||
        org.branches?.some((branch) =>
          branch.assets?.some((asset) =>
            asset.assetName
              .toLowerCase()
              .includes(searchOrganization.assetName.toLowerCase())
          )
        ) ||
        false) &&
      (searchOrganization.status === "" ||
        org.branches?.some((branch) =>
          branch.assets?.some((asset) =>
            asset.status
              .toLowerCase()
              .includes(searchOrganization.status.toLowerCase())
          )
        ) ||
        false)
    );
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredOrganizations.slice(
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

  const handleDeleteSelectedOrganizations = () => {
    dispatch(deleteOrganization(selectedOrganizations));
  };

  const handleSelectAllOrganizations = (e) => {
    if (e.target.checked) {
      dispatch(selectAllOrganizations());
    } else {
      dispatch(deselectAllOrganizations());
    }
  };

  const handleToggleOrganizationSelection = (id) => {
    dispatch(toggleSelectOrganization(id));
  };

  const handlerUpdateData = (org) => {
    dispatch(setSelectedOrganization(org));
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
            ? "lg:w-[78%] md:ml-[260px] md:w-[65%]  "
            : "lg:w-[90%] md:ml-[100px] "
        }`}
      >
        <div className="pt-24">
          <div className="flex justify-between mx-5 mt-2">
            <h3 className="text-xl font-semibold text-[#6c757D]">
              Organization List
            </h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddOrganization(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                Add Organization
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D] ">
              Dashboard
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">Organization</p>
          </div>
        </div>

        <div className=" min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex Users-center gap-2 pt-8 ml-3">
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
                    Organization Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Loaction
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Department name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    User name
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
                    <div className="flex justify-center Users-center ">
                      <div className="">
                        <label className="flex Users-center">
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
                      </div>
                      <button onClick={handleDeleteSelectedOrganizations}>
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
                      id="organizationName"
                      name="organizationName"
                      placeholder="organizationName"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.organizationName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      id="branchName"
                      name="branchName"
                      placeholder="branch name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.branchName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      id="branchLocation"
                      name="branchLocation"
                      placeholder="branch location"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.branchLocation}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      id="departmentName"
                      name="departmentName"
                      placeholder="department name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.departmentName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      name="userName"
                      id="userName"
                      placeholder="user name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.userName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      id="assetName"
                      name="assetName"
                      placeholder="asset name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.assetName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      id="status"
                      name="status"
                      placeholder="asset status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.status}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.map((org, index) => (
                  <tr
                    key={org.id || index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200 divide-y divide-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {org.organizationName}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <ChipsList items={org.branches} labelKey="branchName" />
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <ChipsList
                        items={org.branches}
                        labelKey="branchLocation"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {org.branches
                        ?.flatMap(
                          (branch) =>
                            branch.departments?.map(
                              (dept) => dept.departmentName
                            ) || []
                        )
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {org.branches
                        ?.flatMap(
                          (branch) =>
                            branch.users?.map((user) => user.userName) || []
                        )
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {org.branches
                        ?.flatMap(
                          (branch) =>
                            branch.assets?.map((asset) => asset.assetName) || []
                        )
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {org.branches
                        ?.flatMap(
                          (branch) =>
                            branch.assets?.map((asset) => asset.assetStatus) ||
                            []
                        )
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => {
                          setIsUpdateOrganization(true);
                          handlerUpdateData(org);
                        }}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={
                          selectedOrganizations?.includes(org.id) ?? false
                        }
                        onChange={() =>
                          handleToggleOrganizationSelection(org.id)
                        }
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
              <span className="px-2 space-x-1 ">
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
      {isAddOrganization && (
        <AddOrganization onClose={() => setIsAddOrganization(false)} />
      )}
      {isUpdateOrganization && (
        <UpdateOrganization onClose={() => setIsUpdateOrganization(false)} />
      )}
    </div>
  );
};

export default Organization;

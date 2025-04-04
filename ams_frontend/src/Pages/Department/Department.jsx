import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectDepartment,
  selectAllDepartments,
  deselectAllDepartments,
  setSelectedDepartment,
} from "../../Features/slices/departmentSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import UpdateDepartment from "./UpdateDepartment";
import AddDepartment from "./AddDepartment";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllDepartments } from "../../Features/slices/departmentSlice";
import { deleteDepartment } from "../../Features/slices/departmentSlice";

const UserDepartment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { departments, selectedDepartments, currentPage, rowsPerPage } =
    useSelector((state) => state.departmentData);

  const [isAddDepartment, setIsAddDepartment] = useState(false);
  const [isUpdateDepartment, setIsUpdateDepartment] = useState(false);

  useEffect(() => {
    dispatch(getAllDepartments());
  }, [dispatch, departments.length]);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(departments.length / rowsPerPage);

  const [searchDepartment, setSearchDepartment] = useState({
    departmentName: "",
    branchName: "",
    branchLocation: "",
    userName: "",
    assetName: "",
    status: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredDepartments = departments?.filter((dep) => {
    return (
      (searchDepartment.departmentName === "" || 
       (dep.departmentName || "").toLowerCase().includes(searchDepartment.departmentName.toLowerCase())) &&
      (searchDepartment.branchName === "" || 
       (dep.branch?.branchName || "").toLowerCase().includes(searchDepartment.branchName.toLowerCase())) &&
      (searchDepartment.branchLocation === "" || 
       (dep.branch?.branchLocation || "").toLowerCase().includes(searchDepartment.branchLocation.toLowerCase())) &&
      (searchDepartment.userName === "" || 
       (dep.users?.some(user => user.userName.toLowerCase().includes(searchDepartment.userName.toLowerCase())) || false)) &&
      (searchDepartment.assetName === "" || 
       (dep.Asset?.some(asset => asset.assetName.toLowerCase().includes(searchDepartment.assetName.toLowerCase())) || false)) &&
      (searchDepartment.status === "" || 
       (dep.Asset?.some(asset => asset.status.toLowerCase().includes(searchDepartment.status.toLowerCase())) || false))
    );
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredDepartments.slice(
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

  const handleDeleteSelectedDepartments = () => {
    dispatch(deleteDepartment(selectedDepartments));
  };

  const handleSelectAllDepartments = (e) => {
    if (e.target.checked) {
      dispatch(selectAllDepartments());
    } else {
      dispatch(deselectAllDepartments());
    }
  };

  const handleToggleDepartmentSelection = (id) => {
    dispatch(toggleSelectDepartment(id));
  };

  const handlerUpdateData = (dep) => {
    dispatch(setSelectedDepartment(dep));
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
              Department List
            </h3>
            <div className="flex gap-2 md:gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddDepartment(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                <span className="hidden md:inline">Add Department</span>
                <span className="md:hidden">Add</span>
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
            <p className="text-[#6c757D]">Department</p>
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
                    Department Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Branch Location
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    User Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
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
                              selectedDepartments.length ===
                                departments.length && departments.length > 0
                            }
                            onChange={handleSelectAllDepartments}
                            className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedDepartments}>
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
                      placeholder="Department name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="departmentName"
                      value={searchDepartment.departmentName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Branch name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="branchName"
                      value={searchDepartment.branchName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Branch location"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="branchLocation"
                      value={searchDepartment.branchLocation}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="User name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="userName"
                      value={searchDepartment.userName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Asset name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assetName"
                      value={searchDepartment.assetName}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="status"
                      value={searchDepartment.status}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.map((dep, index) => (
                  <tr
                    key={dep.departmentId || index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200 divide-y divide-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.departmentName}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.branch?.branchName || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.branch?.branchLocation || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.users?.map((user) => user.userName).join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.Asset?.map((asset) => asset.assetName).join(", ") ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {dep.Asset?.map((asset) => asset.status).join(", ") ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => {
                          setIsUpdateDepartment(true);
                          handlerUpdateData(dep);
                        }}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedDepartments?.includes(dep.id) ?? false}
                        onChange={() => handleToggleDepartmentSelection(dep.id)}
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
      {isAddDepartment && (
        <AddDepartment onClose={() => setIsAddDepartment(false)} />
      )}
      {isUpdateDepartment && (
        <UpdateDepartment onClose={() => setIsUpdateDepartment(false)} />
      )}
    </div>
  );
};

export default UserDepartment;
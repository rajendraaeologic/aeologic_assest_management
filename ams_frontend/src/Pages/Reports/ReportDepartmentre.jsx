import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";

import {
  setUsers,
  setCurrentPage,
  setRowsPerPage,
} from "../../Features/DateWishReportSlice";

import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";

import { useNavigate } from "react-router-dom";

const ReportDepartment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { DateWishReportUsers, currentPage, rowsPerPage } = useSelector(
    (state) => state.dateWishReportUser
  );

  useEffect(() => {
    dispatch(
      setUsers([
        {
          id: 1,
          assetname: "Akash",

          departmentname: "Accounts",
          assetserialno: "libeint_v1131t-d0135",
          rfidcode: "3416214B88000000013140891",
          registerdate: "2024-04-04",
          inventorydate: "2024-04-07",
          inventorytime: "06:21 PM",
          ipaddress: "4267226552",
        },
      ])
    );
  }, [dispatch]);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(DateWishReportUsers.length / rowsPerPage);

  const [searchUsers, setSearchUsers] = useState({
    assetname: "",
    departmentname: "",
    assetserialno: "",
    rfidcode: "",
    registerdate: "",
    inventorydate: "",
    inventorytime: "",
    ipaddress: "",
  });
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchUsers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredUsers = DateWishReportUsers?.filter((user) => {
    return Object.entries(searchUsers).every(([key, searchValue]) =>
      (user[key] || "").toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const handleNavigate = () => {
    navigate("/dashboard");
  };

  const handlePrev = () => {
    if (currentPage > 0) dispatch(setCurrentPage(currentPage - 1));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) dispatch(setCurrentPage(currentPage + 1));
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
              Date Wish Report
            </h3>
            <div className="flex justify-center items-center gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
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
            <p className="text-[#6c757D]">Date Wish Report</p>
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
                    Asset Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Department Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset Serial No
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    RFID Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Registered Date
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Inventory Date
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Inventory Time
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Ip Address
                  </th>
                </tr>
              </thead>

              {/* Search Row */}
              <tbody>
                <tr className="bg-gray-100">
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Asset Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.assetname}
                      name="assetname"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder=" Department Name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.departmentname}
                      name="departmentname"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Asset Serial No"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.assetserialno}
                      name="assetserialno"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="RFID Code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.rfidcode}
                      name="rfidcode"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="date"
                      placeholder="Registered Date"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.registerdate}
                      name="registerdate"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="date"
                      placeholder="Inventory Date"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.inventorydate}
                      name="inventorydate"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="time"
                      placeholder="Time"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.inventorytime}
                      name="inventorytime"
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="IpAddress"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      value={searchUsers.ipaddress}
                      name="ipaddress"
                      onChange={handleSearchChange}
                    />
                  </td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200 divide-y divide-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assetname}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.departmentname}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assetserialno}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.rfidcode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.registerdate}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.inventorydate}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.inventorytime}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.ipaddress}
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
    </div>
  );
};

export default ReportDepartment;

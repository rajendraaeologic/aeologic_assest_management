import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setUsers,
  setCurrentPage,
  setRowsPerPage,
} from "../../Features/OutForDeiverySlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";

import UpdateUserForm from "./UpdateUserForm";

import { useNavigate } from "react-router-dom";

const OutForDelivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { deliveryUsers, currentPage, rowsPerPage } = useSelector(
    (state) => state.outForDeliverUser
  );

  const [isUpdateDepartment, setIsUpdateDepartment] = useState(false);
  const [searchUsers, setSearchUsers] = useState({
    assetname: "",
    rfid: "",
    serialno: "",
    status: "",
    date: "",
    time: "",
    assignedto: "",
    usercode: "",
    assigndate: "",
    lastassignedto: "",
    lastassignedusercode: "",
    location: "",
    remark: "",
  });
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchUsers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    dispatch(
      setUsers([
        {
          id: 1,
          assetname: "Liber",
          rfid: "3416214B88000000013140891",
          serialno: "libeint_v1131t-d0135",
          status: "Inward",
          date: "2024-04-07",
          time: "04:22 PM",
          assignedto: "kite",
          usercode: "1003",
          assigndate: "2024-04-04",
          lastassignedto: "admin",
          lastassignedusercode: "1003",
          location: "lab 101",
          remark: "test1234567",
        },
      ])
    );
  }, [dispatch]);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(deliveryUsers.length / rowsPerPage);

  const filteredUsers = deliveryUsers?.filter((user) => {
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
              Out For Delivery
            </h3>
            <div className="flex gap-3 md:mr-8">
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
            <p className="text-[#6c757D]"> Out For Delivery</p>
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
                    RFID
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Serial No
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Status
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Date
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Time
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Assigned To
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    User Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Assigned Date
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Last Assigned To
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Last Assigned User Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Location
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Remark
                  </th>

                  <th className="px-4 py-4 border border-gray-300 w-[100px]">
                    Action
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
                      placeholder="RFID Code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="rfid"
                      value={searchUsers.rfid}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="serial no"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="serialno"
                      value={searchUsers.serialno}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="status"
                      value={searchUsers.status}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="date"
                      placeholder="date"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="date"
                      value={searchUsers.date}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="time"
                      placeholder="time"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="time"
                      value={searchUsers.time}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Assigned To"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assignedto"
                      value={searchUsers.assignedto}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="User Code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="usercode"
                      value={searchUsers.usercode}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="date"
                      placeholder="Assigned Date"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assigndate"
                      value={searchUsers.assigndate}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="last assigned"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="lastassignedto"
                      value={searchUsers.lastassignedto}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="User Code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="lastassignedusercode"
                      value={searchUsers.lastassignedusercode}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="location"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="location"
                      value={searchUsers.location}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="Remark"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="remark"
                      value={searchUsers.remark}
                      onChange={(e) => setSearchDepartmentName(e.target.value)}
                    />
                  </td>

                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
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
                      {user.rfid}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.serialno}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.status}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.date}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.time}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assignedto}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.usercode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assigndate}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.lastassignedto}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.lastassignedusercode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.location}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.remark}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => setIsUpdateDepartment(true)}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
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

      {isUpdateDepartment && (
        <UpdateUserForm onClose={() => setIsUpdateDepartment(false)} />
      )}
    </div>
  );
};

export default OutForDelivery;

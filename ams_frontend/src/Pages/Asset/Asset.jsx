import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import {
  setUsers,
  setCurrentPage,
  setRowsPerPage,
  deleteSelectedUsers,
  toggleSelectUser,
  selectAllUsers,
  deselectAllUsers,
} from "../../Features/UserAssetSlice";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import AddAsset from "./AddAsset";
import UpdateAsset from "./UpdateAsset";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

const Asset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { assetUsersData, selectedUsers, currentPage, rowsPerPage } =
    useSelector((state) => state.assetUserData);
  const [isAddAssetUser, setIsAddAssetUser] = useState(false);
  const [isUpdateAssetUser, setIsUpdateAssetUser] = useState(false);

  useEffect(() => {
    dispatch(
      setUsers([
        {
          id: 1,
          name: "akash",
          serialno: "LG001234",
          department: "Accounts",
          departmentcode: "4001",
          assettype: "sdgvsd",
          make: "Mt",
          assetdetails: "chip",
          model: "CHIP1001",
          mtkassetcode: "	MTK1001",
          hardwaretype: "HARD1",
          status: "inventory",
          assetstatus: "working",
          awb: "	3453535445664",
          amsowner: "Mohan",
          usercode: "102",
          scanstatus: "Not Verified",
        },
        {
          id: 2,
          name: "vikash",
          serialno: "LG001234",
          department: "Accounts",
          departmentcode: "4001",
          assettype: "sdgvsd",
          make: "Mt",
          assetdetails: "chip",
          model: "CHIP1001",
          mtkassetcode: "	MTK1001",
          hardwaretype: "HARD1",
          status: "inventory",
          assetstatus: "working",
          awb: "	3453535445664",
          amsowner: "Mohan",
          usercode: "102",
          scanstatus: "Not Verified",
        },
        {
          id: 3,
          name: "akash",
          serialno: "LG001234",
          department: "Accounts",
          departmentcode: "4001",
          assettype: "sdgvsd",
          make: "Mt",
          assetdetails: "chip",
          model: "CHIP1001",
          mtkassetcode: "	MTK1001",
          hardwaretype: "HARD1",
          status: "inventory",
          assetstatus: "working",
          awb: "	3453535445664",
          amsowner: "Mohan",
          usercode: "102",
          scanstatus: "Not Verified",
        },
        {
          id: 4,
          name: "akash",
          serialno: "LG001234",
          department: "Accounts",
          departmentcode: "4001",
          assettype: "sdgvsd",
          make: "Mt",
          assetdetails: "chip",
          model: "CHIP1001",
          mtkassetcode: "	MTK1001",
          hardwaretype: "HARD1",
          status: "inventory",
          assetstatus: "working",
          awb: "	3453535445664",
          amsowner: "Mohan",
          usercode: "102",
          scanstatus: "Not Verified",
        },
        {
          id: 5,
          name: "akash",
          serialno: "LG001234",
          department: "Accounts",
          departmentcode: "4001",
          assettype: "sdgvsd",
          make: "Mt",
          assetdetails: "chip",
          model: "CHIP1001",
          mtkassetcode: "	MTK1001",
          hardwaretype: "HARD1",
          status: "inventory",
          assetstatus: "working",
          awb: "	3453535445664",
          amsowner: "Mohan",
          usercode: "102",
          scanstatus: "Not Verified",
        },
      ])
    );
  }, [dispatch]);

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(assetUsersData.length / rowsPerPage);

  const [searchUsers, setSearchUsers] = useState({
    name: "",
    serialno: "",
    department: "",
    departmentcode: "",
    assettype: "",
    make: "",
    assetdetails: "",
    model: "",
    mtkassetcode: "",
    hardwaretype: "",
    status: "",
    assetstatus: "",
    awb: "",
    amsowner: "",
    usercode: "",
    scanstatus: "",
  });
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchUsers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filteredUsers = assetUsersData?.filter((user) => {
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

  const handleDeleteSelectedUsers = () => {
    dispatch(deleteSelectedUsers());
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      dispatch(selectAllUsers());
    } else {
      dispatch(deselectAllUsers());
    }
  };

  const handleToggleUserSelection = (id) => {
    dispatch(toggleSelectUser(id));
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
            <h3 className="text-xl font-semibold text-[#6c757D]">Asset List</h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddAssetUser(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                Add Asset
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
            <p className="text-[#6c757D]">Asset List</p>
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
                    Name
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Serial No
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Department
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Department Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset Type
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Make
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset Details
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Model
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    MTK Asset Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Hardware Type
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Status
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Asset Status
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    AWB Number
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    AMS Owner
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    User Code
                  </th>
                  <th className="px-4 py-4 border border-gray-300 w-[240px]">
                    Scan Status
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
                              selectedUsers.length === assetUsersData.length &&
                              assetUsersData.length > 0
                            }
                            onChange={handleSelectAllUsers}
                            className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedUsers}>
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
                      placeholder=" name"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="name"
                      value={searchUsers.name}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="serial no"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="serialno"
                      value={searchUsers.serialno}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="department"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="department"
                      value={searchUsers.department}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="departmnt code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="departmentcode"
                      value={searchUsers.departmentcode}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="asset type"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assettype"
                      value={searchUsers.assettype}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="make"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="make"
                      value={searchUsers.make}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="asset details"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assetdetails"
                      value={searchUsers.assetdetails}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="model"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="model"
                      value={searchUsers.model}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="mtk asset code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="mtkassetcode"
                      value={searchUsers.mtkassetcode}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="hardware type"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="hardwaretype"
                      value={searchUsers.hardwaretype}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="status"
                      value={searchUsers.status}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="asset status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="assetstatus"
                      value={searchUsers.assetstatus}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="awn number"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="awb"
                      value={searchUsers.awb}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="ams owner"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="amsowner"
                      value={searchUsers.amsowner}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="user code"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="usercode"
                      value={searchUsers.usercode}
                      onChange={handleSearchChange}
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]">
                    <input
                      type="text"
                      placeholder="scan status"
                      className="w-80% px-2 py-1 border rounded-md focus:outline-none"
                      name="scanstatus"
                      value={searchUsers.scanstatus}
                      onChange={handleSearchChange}
                    />
                  </td>

                  <td className="px-4 py-3 border border-gray-300 bg-[#b4b6b8]"></td>
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
                      {user.name}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.serialno}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.department}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.departmentcode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assettype}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.make}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assetdetails}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.model}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.mtkassetcode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.hardwaretype}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.status}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.assetstatus}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.awb}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.amsowner}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.usercode}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {user.scanstatus}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => setIsUpdateAssetUser(true)}
                        className="px-3 py-2 rounded-sm bg-[#3BC0C3]"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedUsers?.includes(user.id) ?? false}
                        onChange={() => handleToggleUserSelection(user.id)}
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
      {isAddAssetUser && <AddAsset onClose={() => setIsAddAssetUser(false)} />}
      {isUpdateAssetUser && (
        <UpdateAsset onClose={() => setIsUpdateAssetUser(false)} />
      )}
    </div>
  );
};

export default Asset;

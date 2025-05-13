import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import SliderContext from "../../components/ContexApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import departmentStrings from "../../locales/departmentStrings";

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
import AddDepartment from "./AddDepartment";
import UpdateDepartment from "./UpdateDepartment";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { getAllDepartments } from "../../Features/slices/departmentSlice";
import { deleteDepartment } from "../../Features/slices/departmentSlice";
import { toast } from "react-toastify";

const SkeletonLoader = () => {
  return (
      <>
        {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {[...Array(5)].map((_, cellIndex) => (
                  <td
                      key={cellIndex}
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: cellIndex === 3 ? "100px" : "180px",
                        minWidth: cellIndex === 3 ? "100px" : "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </td>
              ))}
            </tr>
        ))}
      </>
  );
};


const UserDepartment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { departments, selectedDepartments, currentPage, rowsPerPage } =
      useSelector((state) => state.departmentData);

  useEffect(() => {
    dispatch(getAllDepartments());
  }, [dispatch, departments.length]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddDepartment, setIsAddDepartment] = useState(false);
  const [isUpdateDepartment, setIsUpdateDepartment] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const [searchDepartment, setSearchDepartment] = useState({
    departmentName: "",
    branchName: "",
    branchLocation: "",
    // userName: "",
    // assetName: "",
    // status: "",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        await dispatch(getAllDepartments());
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, [dispatch, departments.length]);

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
    setSearchDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredDepartments = departments?.filter((department) => {
    return (
        (searchDepartment.departmentName === "" ||
            (department.departmentName || "")
                .toLowerCase()
                .includes(searchDepartment.departmentName.toLowerCase())) &&
        (searchDepartment.branchName === "" ||
            (department.branch?.branchName || "")
                .toLowerCase()
                .includes(searchDepartment.branchName.toLowerCase())) &&
        (searchDepartment.branchLocation === "" ||
            (department.branch?.branchLocation || "")
                .toLowerCase()
                .includes(searchDepartment.branchLocation.toLowerCase()))
        // &(searchDepartment.userName === "" ||
        //   department.users?.some((user) =>
        //     user.userName
        //       .toLowerCase()
        //       .includes(searchDepartment.userName.toLowerCase())
        //   ) ||
        //   false) &&
        // (searchDepartment.assetName === "" ||
        //   department.assets?.some((asset) =>
        //     asset.assetName
        //       .toLowerCase()
        //       .includes(searchDepartment.assetName.toLowerCase())
        //   ) ||
        //   false) &&
        // (searchDepartment.status === "" ||
        //   department.assets?.some((asset) =>
        //     asset.status
        //       .toLowerCase()
        //       .includes(searchDepartment.status.toLowerCase())
        //   ) ||
        //   false)
    );
  });

  const options = ["5", "10", "25", "50", "100"];
  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredDepartments.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);

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
    if (selectedDepartments.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
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

  const handlerUpdateData = (department) => {
    dispatch(setSelectedDepartment(department));
  };

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      if (departmentToDelete) {
        // Single department delete
        await dispatch(deleteDepartment([departmentToDelete])).unwrap();
        setDeleteMessage(
            departmentStrings.department.modals.deleteSuccess.single
        );
      } else if (selectedDepartments.length > 0) {
        // Multiple departments delete
        await dispatch(deleteDepartment(selectedDepartments)).unwrap();
        setDeleteMessage(
            departmentStrings.department.modals.deleteSuccess.multiple.replace(
                "{count}",
                selectedDepartments.length
            )
        );
      }

      setShowDeleteConfirmation(false);
      setDepartmentToDelete(null);
      dispatch(deselectAllDepartments());
      setShowDeleteSuccessPopup(true);

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 2000);
    } catch (error) {
      toast.error(error || "Delete operation failed", {
        position: "top-right",
        autoClose: 2000,
      });

      // Reset states
      setShowDeleteConfirmation(false);
      setDepartmentToDelete(null);
      dispatch(deselectAllDepartments());
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDepartmentToDelete(null);
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
                {departmentStrings.department.title}
              </h3>
              <div className="flex gap-3 md:mr-8">
                <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                  <CiSaveUp2 className="h-6 w-6" />
                </button>
                <button
                    onClick={() => setIsAddDepartment(true)}
                    className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
                >
                  {departmentStrings.department.buttons.addDepartment}
                </button>
              </div>
            </div>

            <div className="mx-5 flex gap-2 mb-4">
              <button onClick={handleNavigate} className="text-[#6c757D]">
                {departmentStrings.department.breadcrumb.dashboard}
              </button>
              <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
              <p className="text-[#6c757D]">
                {departmentStrings.department.breadcrumb.department}
              </p>
            </div>
          </div>

          <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
            <div className="flex items-center gap-2 pt-8 ml-3">
              <p>{departmentStrings.department.table.showEntries}</p>
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
              <p>{departmentStrings.department.table.entries}</p>
            </div>

            <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
              <table
                  className="table-auto min-w-full text-left border-collapse"
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
                    {departmentStrings.department.table.headers.departmentName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {departmentStrings.department.table.headers.branchName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {departmentStrings.department.table.headers.branchLocation}
                  </th>
                  {/* <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {departmentStrings.department.table.headers.userName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {departmentStrings.department.table.headers.assetName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {departmentStrings.department.table.headers.assetStatus}
                  </th> */}
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {departmentStrings.department.table.headers.action}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {departmentStrings.department.table.headers.deleteAll}
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
                        name="departmentName"
                        placeholder={
                          departmentStrings.department.table.searchPlaceholders
                              .departmentName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchDepartment.departmentName}
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
                        name="branchName"
                        placeholder={
                          departmentStrings.department.table.searchPlaceholders
                              .branchName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchDepartment.branchName}
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
                        name="branchLocation"
                        placeholder={
                          departmentStrings.department.table.searchPlaceholders
                              .branchLocation
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchDepartment.branchLocation}
                        onChange={handleSearchChange}
                        style={{ maxWidth: "100%" }}
                    />
                  </td>
                  {/* <td
                    className="px-2 py-3 border border-gray-300 bg-[#b4b6b8]"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    <input
                      type="text"
                      name="userName"
                      placeholder={
                        departmentStrings.department.table.searchPlaceholders
                          .userName
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchDepartment.userName}
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
                      name="assetName"
                      placeholder={
                        departmentStrings.department.table.searchPlaceholders
                          .assetName
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchDepartment.assetName}
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
                      placeholder={
                        departmentStrings.department.table.searchPlaceholders
                          .status
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchDepartment.status}
                      onChange={handleSearchChange}
                      style={{ maxWidth: "100%" }}
                    />
                  </td> */}
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
                                  selectedDepartments.length ===
                                  departments.length && departments.length > 0
                              }
                              onChange={handleSelectAllDepartments}
                              className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedDepartments}>
                        <MdDelete className="h-6 w-6 text-[red]" />
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>

                {/* Table Body */}
                <tbody>
                {isLoading ? (
                    <SkeletonLoader />
                ) : currentRows.length > 0 ? (
                    currentRows.map((department, index) => (
                        <tr
                            key={department.id || index}
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
                                verticalAlign: "top",
                              }}
                          >
                            {department.departmentName}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {department.branch?.branchName ||
                                departmentStrings.department.notAvailable.emptyText}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{
                                maxWidth: "180px",
                                minWidth: "120px",
                                overflowWrap: "break-word",
                                verticalAlign: "top",
                              }}
                          >
                            {department.branch?.branchLocation ||
                                departmentStrings.department.notAvailable.emptyText}
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{ maxWidth: "100px", wordWrap: "break-word" }}
                          >
                            <div className="flex ">
                              <button
                                  onClick={() => {
                                    setIsUpdateDepartment(true);
                                    handlerUpdateData(department);
                                  }}
                                  className="px-3 py-2 rounded-sm "
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                  onClick={() => handleDeleteClick(department)}
                                  className="px-3 py-2 rounded-sm  text-[red]"
                              >
                                <MdDelete className="h-6 w-6" />
                              </button>
                            </div>
                          </td>
                          <td
                              className="px-2 py-2 text-center border border-gray-300"
                              style={{ maxWidth: "100px", wordWrap: "break-word" }}
                          >
                            <input
                                type="checkbox"
                                checked={
                                    selectedDepartments?.includes(department.id) ??
                                    false
                                }
                                onChange={() =>
                                    handleToggleDepartmentSelection(department.id)
                                }
                            />
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td
                          colSpan="6"
                          className="px-4 py-4 text-center text-black"
                      >
                        {departmentStrings.department.table.noData}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 mx-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredDepartments.length)} of {filteredDepartments.length} entries
              </div>

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 0 || totalPages === 0}
                    className={`px-4 py-2 border-r border-gray-300 ${
                        currentPage === 0 || totalPages === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                    }`}
                >
                  {departmentStrings.department.buttons.previous}
                </button>

                <div className="px-4 py-2">
                  {`${startIndex + 1}–${Math.min(startIndex + rowsPerPage, filteredDepartments.length)} of ${filteredDepartments.length}`}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage + 1 >= totalPages || totalPages === 0}
                    className={`px-4 py-2 border-l border-gray-300 ${
                        currentPage + 1 >= totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                    }`}
                >
                  {departmentStrings.department.buttons.next}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {departmentToDelete
                      ? departmentStrings.department.modals.deleteConfirmation.single
                      : departmentStrings.department.modals.deleteConfirmation.multiple.replace(
                          "{count}",
                          selectedDepartments.length
                      )}
                </h3>
                <div className="flex justify-end gap-4">
                  <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    {departmentStrings.department.buttons.no}
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {departmentStrings.department.buttons.yes}
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
                  {departmentStrings.department.modals.selectFirst}
                </h3>
                <div className="flex justify-end">
                  <button
                      onClick={closeSelectFirstPopup}
                      className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
                  >
                    {departmentStrings.department.buttons.ok}
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

export default UserDepartment;

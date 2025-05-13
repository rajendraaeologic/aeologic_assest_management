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
import ChipsList from "../../components/UI/ChipsList";
import branchStrings from "../../locales/branchStrings";
import { toast } from "react-toastify";

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
      <>
        {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {[...Array(6)].map((_, cellIndex) => (
                  <td
                      key={cellIndex}
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: cellIndex === 4 || cellIndex === 5 ? "100px" : "180px",
                        minWidth: cellIndex === 4 || cellIndex === 5 ? "100px" : "120px",
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

const Branch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  const { branches, selectedBranches, currentPage, rowsPerPage } = useSelector(
      (state) => state.branchData
  );


  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoading(true);
      try {
        await dispatch(getAllBranches());
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, [dispatch, branches.length]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddBranch, setIsAddBranch] = useState(false);
  const [isUpdateBranch, setIsUpdateBranch] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");


  const [searchBranch, setSearchBranch] = useState({
    branchName: "",
    branchLocation: "",
    organizationName: "",
    departmentName: "",
    // userName: "",
    // assetName: "",
    // status: "",
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
            false)
        // &(searchBranch.userName === "" ||
        //   branch.users?.some((user) =>
        //     user.userName
        //       .toLowerCase()
        //       .includes(searchBranch.userName.toLowerCase())
        //   ) ||
        //   false) &&
        // (searchBranch.assetName === "" ||
        //   branch.assets?.some((asset) =>
        //     asset.assetName
        //       .toLowerCase()
        //       .includes(searchBranch.assetName.toLowerCase())
        //   ) ||
        //   false) &&
        // (searchBranch.status === "" ||
        //   branch.assets?.some((asset) =>
        //     asset.status.toLowerCase().includes(searchBranch.status.toLowerCase())
        //   ) ||
        //   false)
    );
  });

  const options = ["5", "10", "25", "50", "100"];
  const startIndex = currentPage * rowsPerPage;
  const currentRows = filteredBranches.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);

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
    if (selectedBranches.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
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

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      if (branchToDelete) {
        // Single branch delete
        await dispatch(deleteBranch([branchToDelete])).unwrap();
        setDeleteMessage(branchStrings.branch.modals.deleteSuccess.single);
      } else if (selectedBranches.length > 0) {
        // Multiple branches delete
        await dispatch(deleteBranch(selectedBranches)).unwrap();
        setDeleteMessage(
            branchStrings.branch.modals.deleteSuccess.multiple.replace(
                "{count}",
                selectedBranches.length
            )
        );
      }

      setShowDeleteConfirmation(false);
      setBranchToDelete(null);
      dispatch(deselectAllBranches());
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
      setBranchToDelete(null);
      dispatch(deselectAllBranches());
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setBranchToDelete(null);
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
                {branchStrings.branch.title}
              </h3>
              <div className="flex gap-3 md:mr-8">
                <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                  <CiSaveUp2 className="h-6 w-6" />
                </button>
                <button
                    onClick={() => setIsAddBranch(true)}
                    className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
                >
                  {branchStrings.branch.buttons.addBranch}
                </button>
              </div>
            </div>

            <div className="mx-5 flex gap-2 mb-4">
              <button onClick={handleNavigate} className="text-[#6c757D]">
                {branchStrings.branch.breadcrumb.dashboard}
              </button>
              <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
              <p className="text-[#6c757D]">
                {branchStrings.branch.breadcrumb.branch}
              </p>
            </div>
          </div>

          <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
            <div className="flex items-center gap-2 pt-8 ml-3">
              <p>{branchStrings.branch.table.showEntries}</p>
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
              <p>{branchStrings.branch.table.entries}</p>
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
                    {branchStrings.branch.table.headers.branchName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {branchStrings.branch.table.headers.branchLocation}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {branchStrings.branch.table.headers.organizationName}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "180px",
                        minWidth: "120px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {branchStrings.branch.table.headers.departmentName}
                  </th>
                  {/* <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.userName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.assetName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {branchStrings.branch.table.headers.assetStatus}
                  </th> */}
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {branchStrings.branch.table.headers.action}
                  </th>
                  <th
                      className="px-2 py-4 border border-gray-300"
                      style={{
                        maxWidth: "100px",
                        minWidth: "100px",
                        overflowWrap: "break-word",
                      }}
                  >
                    {branchStrings.branch.table.headers.deleteAll}
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
                        name="branchName"
                        placeholder={
                          branchStrings.branch.table.searchPlaceholders.branchName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchBranch.branchName}
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
                          branchStrings.branch.table.searchPlaceholders
                              .branchLocation
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchBranch.branchLocation}
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
                        name="organizationName"
                        placeholder={
                          branchStrings.branch.table.searchPlaceholders
                              .organizationName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchBranch.organizationName}
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
                        name="departmentName"
                        placeholder={
                          branchStrings.branch.table.searchPlaceholders
                              .departmentName
                        }
                        className="w-full px-2 py-1 border rounded-md focus:outline-none"
                        value={searchBranch.departmentName}
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
                        branchStrings.branch.table.searchPlaceholders.userName
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.userName}
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
                        branchStrings.branch.table.searchPlaceholders.assetName
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.assetName}
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
                        branchStrings.branch.table.searchPlaceholders.status
                      }
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchBranch.status}
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
                                  selectedBranches.length === branches.length &&
                                  branches.length > 0
                              }
                              onChange={handleSelectAllBranches}
                              className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedBranches}>
                        <MdDelete className="h-6 w-6  text-[red]" />
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
                    currentRows.map((branch, index) => (
                        <tr
                            key={branch.id || index}
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
                            {branch.branchName}
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
                            {branch.branchLocation}
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
                            {branch.company?.organizationName ||
                                branchStrings.branch.notAvailable.emptyText}
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
                            <ChipsList
                                items={branch.departments || []}
                                labelKey="departmentName"
                                emptyText={
                                  branchStrings.branch.notAvailable.emptyText
                                }
                            />
                          </td>
                          <td
                              className="px-2 py-2 border border-gray-300"
                              style={{ maxWidth: "100px", wordWrap: "break-word" }}
                          >
                            <div className="flex ">
                              <button
                                  onClick={() => {
                                    setIsUpdateBranch(true);
                                    handlerUpdateData(branch);
                                  }}
                                  className="px-3 py-2 rounded-sm text-black"
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                  onClick={() => handleDeleteClick(branch)}
                                  className="px-3 py-2 rounded-sm  text-[red]"
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
                                checked={
                                    selectedBranches?.includes(branch.id) ?? false
                                }
                                onChange={() =>
                                    handleToggleBranchSelection(branch.id)
                                }
                            />
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        {branchStrings.branch.table.noData}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 mx-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredBranches.length)} of {filteredBranches.length} entries
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
                  {branchStrings.branch.buttons.previous}
                </button>

                <div className="px-4 py-2">
                  {`${startIndex + 1}–${Math.min(startIndex + rowsPerPage, filteredBranches.length)} of ${filteredBranches.length}`}
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
                  {branchStrings.branch.buttons.next}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isAddBranch && <AddBranch onClose={() => setIsAddBranch(false)} />}
        {isUpdateBranch && (
            <UpdateBranch onClose={() => setIsUpdateBranch(false)} />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {branchToDelete
                      ? branchStrings.branch.modals.deleteConfirmation.single
                      : branchStrings.branch.modals.deleteConfirmation.multiple.replace(
                          "{count}",
                          selectedBranches.length
                      )}
                </h3>
                <div className="flex justify-end gap-4">
                  <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    {branchStrings.branch.buttons.no}
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {branchStrings.branch.buttons.yes}
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
                  {branchStrings.branch.modals.selectFirst}
                </h3>
                <div className="flex justify-end">
                  <button
                      onClick={closeSelectFirstPopup}
                      className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
                  >
                    {branchStrings.branch.buttons.ok}
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

export default Branch;

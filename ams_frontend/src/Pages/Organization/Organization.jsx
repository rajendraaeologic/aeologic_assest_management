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
import organizationStrings from "../../locales/organizationStrings";

const Organization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);

  // Get localized organizationStrings
  const { title, breadcrumb, buttons, table, modals, chipsList } =
    organizationStrings.organization;

  const { organizations, selectedOrganizations, currentPage, rowsPerPage } =
    useSelector((state) => state.organizationData);

  useEffect(() => {
    dispatch(getAllOrganizations());
  }, [dispatch, organizations.length]);

  const [isAddOrganization, setIsAddOrganization] = useState(false);
  const [isUpdateOrganization, setIsUpdateOrganization] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [showSelectFirstPopup, setShowSelectFirstPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const options = ["5", "10", "25", "50", "100"];
  const totalPages = Math.ceil(organizations.length / rowsPerPage);

  const [searchOrganization, setSearchOrganization] = useState({
    organizationName: "",
    branchName: "",
    branchLocation: "",
    departmentName: "",
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
    if (selectedOrganizations.length === 0) {
      setShowSelectFirstPopup(true);
      return;
    }
    setShowDeleteConfirmation(true);
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

  const handleDeleteClick = (org) => {
    setOrganizationToDelete(org.id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (organizationToDelete) {
      dispatch(deleteOrganization([organizationToDelete]));
      setDeleteMessage(modals.deleteSuccess.single);
    } else if (selectedOrganizations.length > 0) {
      dispatch(deleteOrganization(selectedOrganizations));
      setDeleteMessage(
        modals.deleteSuccess.multiple.replace(
          "{count}",
          selectedOrganizations.length
        )
      );
    }
    setShowDeleteConfirmation(false);
    setOrganizationToDelete(null);
    setShowDeleteSuccessPopup(true);
    setTimeout(() => {
      setShowDeleteSuccessPopup(false);
    }, 2000);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setOrganizationToDelete(null);
  };

  const closeSelectFirstPopup = () => {
    setShowSelectFirstPopup(false);
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
            ? "pl-0 md:pl-[250px] lg:pl-[250px]"
            : "pl-0 md:pl-[90px] lg:pl-[90px]"
        }`}
      >
        <div className="pt-24">
          <div className="flex justify-between mx-5 mt-2">
            <h3 className="text-xl font-semibold text-[#6c757D]">{title}</h3>
            <div className="flex gap-3 md:mr-8">
              <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                <CiSaveUp2 className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsAddOrganization(true)}
                className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
              >
                {buttons.addOrganization}
              </button>
            </div>
          </div>

          <div className="mx-5 flex gap-2 mb-4">
            <button onClick={handleNavigate} className="text-[#6c757D] ">
              {breadcrumb.dashboard}
            </button>
            <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
            <p className="text-[#6c757D]">{breadcrumb.organization}</p>
          </div>
        </div>

        <div className=" min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
          <div className="flex Users-center gap-2 pt-8 ml-3">
            <p>{table.showEntries}</p>
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
            <p>{table.entries}</p>
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
                    {table.headers.orgName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.branchName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.branchLocation}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "180px",
                      minWidth: "120px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.departmentName}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.action}
                  </th>
                  <th
                    className="px-2 py-4 border border-gray-300"
                    style={{
                      maxWidth: "100px",
                      minWidth: "100px",
                      overflowWrap: "break-word",
                    }}
                  >
                    {table.headers.deleteAll}
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
                      name="organizationName"
                      placeholder={table.searchPlaceholders.orgName}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.organizationName}
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
                      placeholder={table.searchPlaceholders.branchName}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.branchName}
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
                      placeholder={table.searchPlaceholders.branchLocation}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.branchLocation}
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
                      placeholder={table.searchPlaceholders.departmentName}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none"
                      value={searchOrganization.departmentName}
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
                              selectedOrganizations.length ===
                                organizations.length && organizations.length > 0
                            }
                            onChange={handleSelectAllOrganizations}
                            className="mr-2"
                          />
                        </label>
                      </div>
                      <button onClick={handleDeleteSelectedOrganizations}>
                        <MdDelete className="h-6 w-6  text-[red]" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>

              {/* Table Body */}
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((org, index) => (
                    <tr
                      key={org.id || index}
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
                        {org.organizationName}
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
                          items={org.branches}
                          labelKey="branchName"
                          emptyText={chipsList.emptyText}
                        />
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
                          items={org.branches}
                          labelKey="branchLocation"
                          emptyText={chipsList.emptyText}
                        />
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
                          items={
                            org.branches?.flatMap(
                              (branch) => branch.departments || []
                            ) || []
                          }
                          labelKey="departmentName"
                          emptyText={chipsList.emptyText}
                        />
                      </td>
                      <td
                        className="px-2 py-2 border border-gray-300"
                        style={{ maxWidth: "100px", wordWrap: "break-word" }}
                      >
                        <div className="flex ">
                          <button
                            onClick={() => {
                              setIsUpdateOrganization(true);
                              handlerUpdateData(org);
                            }}
                            className="px-3 py-2 rounded-sm "
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(org)}
                            className="px-3 py-2 rounded-sm   text-[red]"
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
                            selectedOrganizations?.includes(org.id) ?? false
                          }
                          onChange={() =>
                            handleToggleOrganizationSelection(org.id)
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
                      {table.noData}
                    </td>
                  </tr>
                )}
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
                {buttons.previous}
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
                {buttons.next}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {organizationToDelete
                ? modals.deleteConfirmation.single
                : modals.deleteConfirmation.multiple.replace(
                    "{count}",
                    selectedOrganizations.length
                  )}
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                {buttons.no}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                {buttons.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select First Popup */}
      {showSelectFirstPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{modals.selectFirst}</h3>
            <div className="flex justify-end">
              <button
                onClick={closeSelectFirstPopup}
                className="px-4 py-2 bg-[#3bc0c3] text-white rounded-md"
              >
                {buttons.ok}
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

export default Organization;

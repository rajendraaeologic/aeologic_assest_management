import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import assignAssetStrings from "../../locales/assignAssetString.js";
import {
  updateAssignAsset,
  getAllAssignAssets,
} from "../../Features/slices/assignAssetSlice.js";

const UpdateAssignAsset = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const selectedAssignment = useSelector(
    (state) => state.assignAssetData.selectedAssignAsset
  );
  const { currentPage, rowsPerPage } = useSelector(
    (state) => state.assignAssetData
  );
  // User dropdown state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Asset dropdown state
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetPage, setAssetPage] = useState(1);
  const [hasMoreAssets, setHasMoreAssets] = useState(true);
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Organization dropdown state
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Branch dropdown state
  const [branches, setBranches] = useState([]);
  const [branchPage, setBranchPage] = useState(1);
  const [hasMoreBranches, setHasMoreBranches] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Department dropdown state
  const [departments, setDepartments] = useState([]);
  const [departmentPage, setDepartmentPage] = useState(1);
  const [hasMoreDepts, setHasMoreDepts] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");
  const selectedOrgId = watch("companyId");
  const userId = watch("userId");

  const fetchOrganizations = async (page, search = "") => {
    try {
      setOrgLoading(true);
      const response = await API.get(
        `/organization/getAllOrganizations?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;
      setOrganizations((prev) => (page === 1 ? data : [...prev, ...data]));
      setOrgPage(page);
      setHasMoreOrgs(page < totalPages);
    } catch (error) {
      toast.error("Error fetching organizations", error);
    } finally {
      setOrgLoading(false);
    }
  };

  const fetchBranches = async (page, search = "") => {
    if (!selectedOrgId) return;
    try {
      setLoadingBranches(true);
      const response = await API.get(
        `/branch/${selectedOrgId}/branches?limit=5&page=${page}&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;
      setBranches((prev) => (page === 1 ? data : [...prev, ...data]));
      setBranchPage(page);
      setHasMoreBranches(page < totalPages);
    } catch (error) {
      toast.error("Error fetching branches", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchDepartments = async (page, search = "") => {
    if (!branchId) return;
    try {
      setLoadingDepartments(true);
      const response = await API.get(
        `/department/${branchId}/departments?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;
      setDepartments((prev) => (page === 1 ? data : [...prev, ...data]));
      setDepartmentPage(page);
      setHasMoreDepts(page < totalPages);
    } catch (error) {
      toast.error("Error fetching departments", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchUsersByDepartmentId = async (page, search = "") => {
    if (!departmentId) return;
    try {
      setLoadingUsers(true);
      const response = await API.get(
        `/assignAsset/${departmentId}/users?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;
      setUsers((prev) => (page === 1 ? data : [...prev, ...data]));
      setUserPage(page);
      setHasMoreUsers(page < totalPages);
    } catch (error) {
      toast.error("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAssetsByDepartmentId = async (page, search = "") => {
    if (!departmentId) return;
    try {
      setLoadingAssets(true);
      const response = await API.get(
        `/assignAsset/${departmentId}/assets?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;
      setAssets((prev) => (page === 1 ? data : [...prev, ...data]));
      setAssetPage(page);
      setHasMoreAssets(page < totalPages);
    } catch (error) {
      toast.error("Error fetching assets", error);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (selectedOrgId) {
      fetchBranches(1, branchSearchTerm);
    }
  }, [selectedOrgId, branchSearchTerm]);

  useEffect(() => {
    if (branchId) {
      fetchDepartments(1, deptSearchTerm);
    }
  }, [branchId, deptSearchTerm]);

  useEffect(() => {
    if (departmentId) {
      fetchUsersByDepartmentId(1, userSearchTerm);
      fetchAssetsByDepartmentId(1, assetSearchTerm);
    }
  }, [departmentId, userSearchTerm, assetSearchTerm]);

  useEffect(() => {
    fetchOrganizations(1, "");
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      reset({
        companyId: selectedAssignment.user?.company?.id,
        branchId: selectedAssignment.user?.branch?.id,
        departmentId: selectedAssignment.user?.department?.id,
        assetId: selectedAssignment.asset?.id,
        userId: selectedAssignment.user?.id,
      });

      // Set selected organization if exists
      if (selectedAssignment.user?.company) {
        setSelectedOrg(selectedAssignment.user.company);
        setOrganizations((prev) =>
          prev.some((org) => org.id === selectedAssignment.user.company.id)
            ? prev
            : [...prev, selectedAssignment.user.company]
        );
      }

      // Set selected branch if exists
      if (selectedAssignment.user?.branch) {
        setSelectedBranch(selectedAssignment.user.branch);
        setBranches((prev) =>
          prev.some((b) => b.id === selectedAssignment.user.branch.id)
            ? prev
            : [...prev, selectedAssignment.user.branch]
        );
      }

      // Set selected department if exists
      if (selectedAssignment.user?.department) {
        setSelectedDept(selectedAssignment.user.department);
        setDepartments((prev) =>
          prev.some((d) => d.id === selectedAssignment.user.department.id)
            ? prev
            : [...prev, selectedAssignment.user.department]
        );
      }

      // Set selected asset if exists
      if (selectedAssignment.asset) {
        setSelectedAsset(selectedAssignment.asset);
        setAssets((prev) =>
          prev.some((a) => a.id === selectedAssignment.asset.id)
            ? prev
            : [...prev, selectedAssignment.asset]
        );
      }

      // Set selected user if exists
      if (selectedAssignment.user) {
        setSelectedUser(selectedAssignment.user);
        setUsers((prev) =>
          prev.some((u) => u.id === selectedAssignment.user.id)
            ? prev
            : [...prev, selectedAssignment.user]
        );
      }
    }
  }, [selectedAssignment, reset]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  };

  // Organization handlers
  const handleOrgScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !orgLoading && hasMoreOrgs) {
      fetchOrganizations(orgPage + 1, searchTerm);
    }
  };

  const handleOrgSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    fetchOrganizations(1, search);
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setValue("companyId", org.id, { shouldValidate: true });
    setShowOrgDropdown(false);
    setSearchTerm("");
    setValue("branchId", "");
    setValue("departmentId", "");
    setValue("assetId", "");
    setValue("userId", "");
    setBranches([]);
    setDepartments([]);
    setAssets([]);
    setUsers([]);
    setSelectedBranch(null);
    setSelectedDept(null);
    setSelectedAsset(null);
    setSelectedUser(null);
  };

  // Branch handlers
  const handleBranchScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !loadingBranches && hasMoreBranches) {
      fetchBranches(branchPage + 1, branchSearchTerm);
    }
  };

  const handleBranchSearch = (e) => {
    const search = e.target.value;
    setBranchSearchTerm(search);
    fetchBranches(1, search);
  };

  const handleBranchSelect = (branch) => {
    setValue("branchId", branch.id, { shouldValidate: true });
    setSelectedBranch(branch);
    setShowBranchDropdown(false);
    setValue("departmentId", "");
    setValue("assetId", "");
    setValue("userId", "");
    setDepartments([]);
    setAssets([]);
    setUsers([]);
    setSelectedDept(null);
    setSelectedAsset(null);
    setSelectedUser(null);
    setDeptSearchTerm("");
    setDepartmentPage(1);
  };

  // Department handlers
  const handleDeptScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !loadingDepartments && hasMoreDepts) {
      fetchDepartments(departmentPage + 1, deptSearchTerm);
    }
  };

  const handleDeptSearch = (e) => {
    const search = e.target.value;
    setDeptSearchTerm(search);
    fetchDepartments(1, search);
  };

  const handleDeptSelect = (dept) => {
    setValue("departmentId", dept.id, { shouldValidate: true });
    setSelectedDept(dept);
    setShowDeptDropdown(false);
    setValue("assetId", "");
    setValue("userId", "");
    setAssets([]);
    setUsers([]);
    setSelectedAsset(null);
    setSelectedUser(null);
  };

  // Asset handlers
  const handleAssetScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !loadingAssets && hasMoreAssets) {
      fetchAssetsByDepartmentId(assetPage + 1, assetSearchTerm);
    }
  };

  const handleAssetSearch = (e) => {
    const search = e.target.value;
    setAssetSearchTerm(search);
    fetchAssetsByDepartmentId(1, search);
  };

  const handleAssetSelect = (asset) => {
    setValue("assetId", asset.id, { shouldValidate: true });
    setSelectedAsset(asset);
    setShowAssetDropdown(false);
  };

  // User handlers
  const handleUserScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !loadingUsers && hasMoreUsers) {
      fetchUsersByDepartmentId(userPage + 1, userSearchTerm);
    }
  };

  const handleUserSearch = (e) => {
    const search = e.target.value;
    setUserSearchTerm(search);
    fetchUsersByDepartmentId(1, search);
  };

  const handleUserSelect = (user) => {
    setValue("userId", user.id, { shouldValidate: true });
    setSelectedUser(user);
    setShowUserDropdown(false);
  };

  const onSubmit = async (data) => {
    try {
      // Check if required IDs are available
      if (!selectedAssignment || !selectedAssignment.id) {
        toast.error("Selected assignment is missing or invalid");
        return;
      }

      if (!data.assetId || !data.userId) {
        toast.error("Asset and user selection are required");
        return;
      }

      const payload = {
        params: { assignmentId: selectedAssignment.id },
        body: {
          assetId: data.assetId,
          userId: data.userId,
        },
      };

      console.log("Updating assignment with payload:", payload);

      // Dispatch the update action
      await dispatch(updateAssignAsset(payload)).unwrap();

      // After successful update, refresh the assignments list
      await dispatch(
        getAllAssignAssets({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();

      toast.success(assignAssetStrings.updateAssignAsset.toast.success, {
        position: "top-right",
        autoClose: 1500,
      });

      handleClose();
    } catch (error) {
      console.error("Error updating assignment:", error);

      // Handle specific error cases
      if (error?.message) {
        // Specifically handle the asset in use error
        if (
          error.message.includes("not available for assignment") ||
          error.message.includes("IN_USE")
        ) {
          toast.error(
            "The selected asset is already in use and cannot be assigned",
            {
              autoClose: 3000,
            }
          );
          return;
        }

        // Display the specific error message from the backend if available
        toast.error(error.message, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Default error message
      toast.error(assignAssetStrings.updateAssignAsset.toast.error, {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 overflow-y-scroll px-1 md:px-0 bg-black bg-opacity-50 z-50 flex justify-center items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`mt-[20px] w-[550px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {assignAssetStrings.updateAssignAsset.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden Inputs with Validation */}
            <input
              type="hidden"
              {...register("companyId", {
                required:
                  assignAssetStrings.updateAssignAsset.validation
                    .organizationRequired,
              })}
            />
            <input
              type="hidden"
              {...register("branchId", {
                required:
                  assignAssetStrings.updateAssignAsset.validation
                    .branchRequired,
              })}
            />
            <input
              type="hidden"
              {...register("departmentId", {
                required:
                  assignAssetStrings.updateAssignAsset.validation
                    .departmentRequired,
              })}
            />
            <input
              type="hidden"
              {...register("assetId", {
                required:
                  assignAssetStrings.updateAssignAsset.validation.assetRequired,
              })}
            />
            <input
              type="hidden"
              {...register("userId", {
                required:
                  assignAssetStrings.updateAssignAsset.validation
                    .userNameRequired,
              })}
            />

            <div className="grid grid-cols-1 gap-4">
              {/* Organization Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.organization}
                </label>
                <div
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : "Select Organization"}
                </div>
                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyId.message}
                  </p>
                )}
                {showOrgDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search organization..."
                      value={searchTerm}
                      onChange={handleOrgSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleOrgScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {organizations.map((org) => (
                        <li
                          key={org.id}
                          onClick={() => handleOrgSelect(org)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {org.organizationName}
                        </li>
                      ))}
                      {orgLoading && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.branch}
                </label>
                <div
                  onClick={() => {
                    if (!selectedOrgId) {
                      toast.error("Please select an organization first");
                      return;
                    }
                    setShowBranchDropdown(!showBranchDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedBranch ? selectedBranch.branchName : "Select Branch"}
                </div>
                {errors.branchId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchId.message}
                  </p>
                )}
                {showBranchDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search branch..."
                      value={branchSearchTerm}
                      onChange={handleBranchSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleBranchScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {branches.map((branch) => (
                        <li
                          key={branch.id}
                          onClick={() => handleBranchSelect(branch)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {branch.branchName}
                        </li>
                      ))}
                      {loadingBranches && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.department}
                </label>
                <div
                  onClick={() => {
                    if (!branchId) {
                      toast.error("Please select a branch first");
                      return;
                    }
                    setShowDeptDropdown(!showDeptDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedDept
                    ? selectedDept.departmentName
                    : "Select Department"}
                </div>
                {errors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
                {showDeptDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search department..."
                      value={deptSearchTerm}
                      onChange={handleDeptSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleDeptScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {departments.map((dept) => (
                        <li
                          key={dept.id}
                          onClick={() => handleDeptSelect(dept)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {dept.departmentName}
                        </li>
                      ))}
                      {loadingDepartments && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Asset Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.asset}
                </label>
                <div
                  onClick={() => {
                    if (!departmentId) {
                      toast.error("Please select a department first");
                      return;
                    }
                    setShowAssetDropdown(!showAssetDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedAsset
                    ? `${selectedAsset.assetName} `
                    : "Select Asset"}
                </div>
                {showAssetDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search asset..."
                      value={assetSearchTerm}
                      onChange={handleAssetSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleAssetScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {assets.map((asset) => {
                        const isCurrentAsset =
                          selectedAssignment?.asset?.id === asset.id;
                        const isInUse = asset.status === "IN_USE";
                        const isDisabled = isInUse && !isCurrentAsset;

                        return (
                          <li
                            key={asset.id}
                            onClick={() =>
                              !isDisabled && handleAssetSelect(asset)
                            }
                            className={`px-4 py-2 hover:bg-gray-100 ${
                              isDisabled
                                ? "cursor-not-allowed text-gray-400"
                                : "cursor-pointer"
                            }`}
                          >
                            {asset.assetName}
                            {isInUse && (
                              <span className="ml-2 text-sm text-red-500">
                                {isCurrentAsset ? "(Current)" : "(In Use)"}
                              </span>
                            )}
                          </li>
                        );
                      })}
                      {loadingAssets && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                      {assets.length === 0 && !loadingAssets && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          No available assets found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {errors.assetId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assetId.message}
                  </p>
                )}
              </div>

              {/* User Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.userName}
                </label>
                <div
                  onClick={() => {
                    if (!departmentId) return;
                    setShowUserDropdown(!showUserDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {users.find((u) => u.id === watch("userId"))
                    ? `${users.find((u) => u.id === watch("userId")).userName} `
                    : assignAssetStrings.updateAssignAsset.select.userDefault}
                </div>
                {errors.userId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userId.message}
                  </p>
                )}
                {showUserDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search user..."
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleUserScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {users.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {user.userName}
                        </li>
                      ))}
                      {loadingUsers && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <hr className="mt-4" />
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {assignAssetStrings.updateAssignAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? assignAssetStrings.updateAssignAsset.buttons.updating
                  : assignAssetStrings.updateAssignAsset.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAssignAsset;

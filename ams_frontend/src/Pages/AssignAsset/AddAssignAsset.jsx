import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import assignAssetStrings from "../../locales/assignAssetString.js";
import {
  createAssignAsset,
  getAllAssignAssets,
} from "../../Features/slices/assignAssetSlice.js";

const AddAssignAsset = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // State variables for dropdowns
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetPage, setAssetPage] = useState(1);
  const [hasMoreAssets, setHasMoreAssets] = useState(true);
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [branches, setBranches] = useState([]);
  const [branchPage, setBranchPage] = useState(1);
  const [hasMoreBranches, setHasMoreBranches] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedOrgId, setSelectedOrgId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [departmentPage, setDepartmentPage] = useState(1);
  const [hasMoreDepts, setHasMoreDepts] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const { currentPage, rowsPerPage } = useSelector(
    (state) => state.assignAssetData
  );
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      companyId: "",
      branchId: "",
      departmentId: "",
      assetId: "",
      userId: "",
    },
  });

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");
  const assetId = watch("assetId");
  const userId = watch("userId");

  // Fetch users by department
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
      console.error("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      setUserSearchTerm("");
      setUserPage(1);
      fetchUsersByDepartmentId(1, "");
    } else {
      setUsers([]);
      setValue("userId", "");
    }
  }, [departmentId]);

  // Fetch assets by department
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
      console.error("Error fetching assets", error);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      setAssetSearchTerm("");
      setAssetPage(1);
      fetchAssetsByDepartmentId(1, "");
    } else {
      setAssets([]);
      setValue("assetId", "");
    }
  }, [departmentId]);

  // Fetch organizations
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
      console.error("Error fetching organizations", error);
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(1, "");
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fetch branches
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
      console.error("Error fetching branches", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch departments
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
      console.error("Error fetching departments", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (selectedOrgId) {
      setBranchSearchTerm("");
      setBranchPage(1);
      fetchBranches(1, "");
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (branchId) {
      fetchDepartments(1, deptSearchTerm);
    }
  }, [branchId, deptSearchTerm]);

  // User dropdown handlers
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
    setShowUserDropdown(false);
  };

  // Asset dropdown handlers
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
    setShowAssetDropdown(false);
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
    setSelectedOrgId(org.id);
    setValue("companyId", org.id, { shouldValidate: true });
    setShowOrgDropdown(false);
    setSearchTerm("");
    setValue("branchId", "");
    setValue("departmentId", "");
    setValue("userId", "");
    setBranches([]);
    setDepartments([]);
    setUsers([]);
    setSelectedBranch(null);
    setSelectedDept(null);
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
    setValue("userId", "");
    setDepartments([]);
    setUsers([]);
    setSelectedDept(null);
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
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      reset();
    }, 300);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  };

  // Register form validation
  useEffect(() => {
    register("companyId", {
      required:
        assignAssetStrings.addAssignAsset.validation.organizationRequired,
    });
    register("branchId", {
      required: assignAssetStrings.addAssignAsset.validation.branchRequired,
    });
    register("departmentId", {
      required: assignAssetStrings.addAssignAsset.validation.departmentRequired,
    });
    register("assetId", {
      required: assignAssetStrings.addAssignAsset.validation.assetRequired,
    });
    register("userId", {
      required: assignAssetStrings.addAssignAsset.validation.userNameRequired,
    });
  }, [register]);

  const onSubmit = async (data) => {
    if (!data.companyId) {
      toast.error("Please select a valid organization", {
        position: "top-right",
        autoClose: 1000,
      });
      return;
    }

    try {
      const payload = {
        assetId: data.assetId,
        userId: data.userId,
      };

      await dispatch(createAssignAsset(payload)).unwrap();
      await dispatch(
        getAllAssignAssets({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();

      // Refresh available assets
      if (departmentId) {
        fetchAssetsByDepartmentId(1, "");
      }

      toast.success(assignAssetStrings.addAssignAsset.toast.success, {
        position: "top-right",
        autoClose: 2000,
      });

      setIsVisible(false);
      reset();
      onClose();
    } catch (error) {
      const errorMessage = error?.message || "";

      if (
        errorMessage.includes("Asset is not available for assignment") ||
        errorMessage.includes("IN_USE")
      ) {
        toast.error(
          "The selected asset is already in use and cannot be assigned",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return setError("assetId", {
          type: "manual",
          message: "This asset is already in use",
        });
      }

      // Handle other errors
      toast.error(
        errorMessage || assignAssetStrings.addAssignAsset.toast.error,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
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
        className={`mt-[20px] w-[500px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {assignAssetStrings.addAssignAsset.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Organization Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.organization}
                </label>
                <div
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : assignAssetStrings.addAssignAsset.select
                        .organizationDefault}
                </div>
                {errors.companyId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyId.message}
                  </p>
                )}
                {showOrgDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder={
                        assignAssetStrings.addAssignAsset.select
                          .organizationDefault
                      }
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
                          {
                            assignAssetStrings.addAssignAsset.select
                              .loadingBranches
                          }
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <div
                  onClick={() => {
                    if (!selectedOrgId) return;
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
                  Department
                </label>
                <div
                  onClick={() => {
                    if (!branchId) return;
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

              {/* Asset Select */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.asset}
                </label>
                <div
                  onClick={() => {
                    if (!departmentId) return;
                    setShowAssetDropdown(!showAssetDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {assets.find((a) => a.id === assetId)
                    ? `${assets.find((a) => a.id === assetId).assetName} `
                    : assignAssetStrings.addAssignAsset.select.assetDefault}
                </div>
                {errors.assetId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assetId.message}
                  </p>
                )}
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
                        const isInUse = asset.status === "IN_USE";
                        return (
                          <li
                            key={asset.id}
                            onClick={() => !isInUse && handleAssetSelect(asset)}
                            className={`px-4 py-2 hover:bg-gray-100 ${
                              isInUse
                                ? "cursor-not-allowed text-gray-400"
                                : "cursor-pointer"
                            }`}
                          >
                            {asset.assetName}
                            {isInUse && (
                              <span className="ml-2 text-sm text-red-500">
                                (In Use)
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
              </div>

              {/* User Select */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.userName}
                </label>
                <div
                  onClick={() => {
                    if (!departmentId) return;
                    setShowUserDropdown(!showUserDropdown);
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {users.find((u) => u.id === watch("userId"))
                    ? `${users.find((u) => u.id === watch("userId")).userName}`
                    : assignAssetStrings.addAssignAsset.select.userDefault}
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
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {assignAssetStrings.addAssignAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? assignAssetStrings.addAssignAsset.buttons.saving
                  : assignAssetStrings.addAssignAsset.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAssignAsset;

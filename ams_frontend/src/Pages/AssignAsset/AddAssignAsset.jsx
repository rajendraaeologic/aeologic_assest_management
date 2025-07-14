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

  const branchDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const assetDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

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

  const [branches, setBranches] = useState([]);
  const [branchPage, setBranchPage] = useState(1);
  const [hasMoreBranches, setHasMoreBranches] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedOrgId] = useState("");

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
  const { user } = useSelector((state) => state.auth);

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
      companyId: user?.companyId ,
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
      console.log("users",response)
      const {
        data: {
          data: { users,pagination },
        },
      } = response;
      setUsers((prev) =>
          page === 1 ? users : [...prev, ...users]
      );
      setUserPage(page);
      setHasMoreUsers(page < pagination.totalPages);
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
    if (!departmentId) {
      setAssets([]);
      return;
    }

    try {
      setLoadingAssets(true);
      const response = await API.get(
        `/assignAsset/${departmentId}/assets?page=${page}&limit=5&searchTerm=${search}`
      );

      const { data } = response;

      if (data && data.data) {
        setAssets(prev =>
            page === 1 ? data.data.assets : [...prev, ...data.data.assets]
        );
        setAssetPage(page);
        setHasMoreAssets(page < data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching assets", error);
      toast.error("Failed to fetch assets");
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
  }, [departmentId, setValue]);

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    if (user?.companyId) {
      fetchBranches(1, "");
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [user?.companyId]);

  // Fetch branches
  const fetchBranches = async (page, search = "") => {
    if (!user?.companyId) return;
    try {
      setLoadingBranches(true);
      const response = await API.get(
          `/branch/${user.companyId}/branches?limit=5&page=${page}&searchTerm=${search}`
      );
      const {
        data: {
          data: { branches,pagination },
        },
      } = response;
      setBranches((prev) =>
          page === 1 ? branches : [...prev, ...branches]
      );
      setBranchPage(page);
      setHasMoreBranches(page < pagination.totalPages);
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
      console.log("depat",response)
      const {
        data: {
          data: { departments,pagination },
        },
      } = response;
      setDepartments((prev) =>
          page === 1 ? departments : [...prev, ...departments]
      );
      setDepartmentPage(page);
      setHasMoreDepts(page < pagination.totalPages);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBranchDropdown && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
      if (showDeptDropdown && deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
      }
      if (showAssetDropdown && assetDropdownRef.current && !assetDropdownRef.current.contains(event.target)) {
        setShowAssetDropdown(false);
      }
      if (showUserDropdown && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    if (showBranchDropdown || showDeptDropdown || showAssetDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBranchDropdown, showDeptDropdown, showAssetDropdown, showUserDropdown]);

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

  const handleBranchClick = async () => {
    setShowBranchDropdown((prev) => !prev);
    if (!showBranchDropdown) {
      setBranchSearchTerm("");
      setBranchPage(1);
      setBranches([]);
      await fetchBranches(1, "");
    }
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

  const handleDeptClick = async () => {
    setShowDeptDropdown((prev) => !prev);
    if (!showDeptDropdown) {
      setDeptSearchTerm("");
      setDepartmentPage(1);
      setDepartments([]);
      await fetchDepartments(1, "");
    }
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
    if (!user?.companyId) {
      toast.error("User organization not found", {
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

              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <div
                    onClick={!isSubmitting ? () => {
                      handleBranchClick();
                      if (!user?.companyId) {
                        toast.error("organization not found");
                        return;
                      }
                      setShowBranchDropdown(!showBranchDropdown);
                    } : undefined}
                    className={`mt-1 p-2 w-full border ${
                        errors.branchId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {selectedBranch ? selectedBranch.branchName : "Select Branch"}
                </div>
                {errors.branchId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.branchId.message}
                    </p>
                )}
                {showBranchDropdown && !isSubmitting && (
                    <div
                        ref={branchDropdownRef}
                        className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow"
                    >
                      <input
                          type="text"
                          placeholder="Search branch..."
                          value={branchSearchTerm}
                          onChange={handleBranchSearch}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          className="p-2 w-full border-b outline-none"
                          disabled={isSubmitting}
                      />
                      <ul
                          onScroll={handleBranchScroll}
                          className="max-h-40 overflow-auto"
                      >
                        {branches.length === 0 && !loadingBranches ? (
                            <li className="px-4 py-2 text-sm text-gray-500">
                              {branchSearchTerm ? "No branches found" : "No branches exist"}
                            </li>
                        ) : (
                            <>
                              {branches.map((branch) => (
                                  <li
                                      key={branch.id}
                                      onClick={!isSubmitting ? () => handleBranchSelect(branch) : undefined}
                                      className={`px-4 py-2 hover:bg-gray-100 ${
                                          isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                                      }`}
                                  >
                                    {branch.branchName}
                                  </li>
                              ))}
                              {loadingBranches && (
                                  <li className="px-4 py-2 text-sm text-gray-500">
                                    {assignAssetStrings.addAssignAsset.select.loadingBranches}
                                  </li>
                              )}
                            </>
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
                    onClick={!isSubmitting ? () => {
                      handleDeptClick();
                      if (!branchId) {
                        toast.error("Please select a branch first");
                        return;
                      }
                      setShowDeptDropdown(!showDeptDropdown);
                    } : undefined}
                    className={`mt-1 p-2 w-full border ${
                        errors.departmentId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
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
                {showDeptDropdown && !isSubmitting && (
                    <div
                        ref={deptDropdownRef}
                        className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow"
                    >
                      <input
                          type="text"
                          placeholder="Search department..."
                          value={deptSearchTerm}
                          onChange={handleDeptSearch}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          className="p-2 w-full border-b outline-none"
                          disabled={isSubmitting}
                      />
                      <ul
                          onScroll={handleDeptScroll}
                          className="max-h-40 overflow-auto"
                      >
                        {departments.length === 0 && !loadingDepartments ? (
                            <li className="px-4 py-2 text-sm text-gray-500">
                              {deptSearchTerm ? "No departments found" : "No departments exist"}
                            </li>
                        ) : (
                            <>
                              {departments.map((dept) => (
                                  <li
                                      key={dept.id}
                                      onClick={!isSubmitting ? () => handleDeptSelect(dept) : undefined}
                                      className={`px-4 py-2 hover:bg-gray-100 ${
                                          isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                                      }`}
                                  >
                                    {dept.departmentName}
                                  </li>
                              ))}
                              {loadingDepartments && (
                                  <li className="px-4 py-2 text-sm text-gray-500">
                                    {assignAssetStrings.addAssignAsset.select.loadingDepartments}
                                  </li>
                              )}
                            </>
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
                    onClick={!isSubmitting ? () => {
                      if (!departmentId) {
                        toast.error("Please select a department first");
                        return;
                      }
                      setShowAssetDropdown(!showAssetDropdown);
                    } : undefined}
                    className={`mt-1 p-2 w-full border ${
                        errors.assetId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {assets.find((a) => a.id === assetId)
                      ? assets.find((a) => a.id === assetId).assetName
                      : assignAssetStrings.addAssignAsset.select.assetDefault}
                </div>
                {errors.assetId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.assetId.message}
                    </p>
                )}
                {showAssetDropdown && !isSubmitting && (
                    <div
                        ref={assetDropdownRef}
                        className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow"
                    >
                      <input
                          type="text"
                          placeholder="Search asset..."
                          value={assetSearchTerm}
                          onChange={handleAssetSearch}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          className="p-2 w-full border-b outline-none"
                          disabled={isSubmitting}
                      />
                      <ul
                          onScroll={handleAssetScroll}
                          className="max-h-40 overflow-auto"
                      >
                        {assets.length === 0 && !loadingAssets ? (
                            <li className="px-4 py-2 text-sm text-gray-500">
                              {assetSearchTerm ? "No assets found" : "No available assets exist"}
                            </li>
                        ) : (
                            <>
                              {assets.map((asset) => {
                                const isUnassigned = asset.status === "UNASSIGNED";
                                const isDisabled = !isUnassigned || isSubmitting;

                                return (
                                    <li
                                        key={asset.id}
                                        onClick={() => {
                                          if (!isDisabled) handleAssetSelect(asset);
                                        }}
                                        className={`px-4 py-2 hover:bg-gray-100 ${
                                            isDisabled
                                                ? "cursor-not-allowed text-gray-400"
                                                : "cursor-pointer text-black"
                                        }`}
                                    >
                                      {asset.assetName}
                                      {!isUnassigned && (
                                          <span className="ml-2 text-sm text-red-500">
                      ({asset.status.replace("_", " ")})
                    </span>
                                      )}
                                    </li>
                                );
                              })}
                              {loadingAssets && (
                                  <li className="px-4 py-2 text-sm text-gray-500">
                                    {assignAssetStrings.addAssignAsset.select.loadingAssets}
                                  </li>
                              )}
                            </>
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
                    onClick={!isSubmitting ? () => {
                      if (!departmentId) return;
                      setShowUserDropdown(!showUserDropdown);
                    } : undefined}
                    className={`mt-1 p-2 w-full border ${
                        errors.userId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
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
                {showUserDropdown && !isSubmitting && (
                    <div
                        ref={userDropdownRef}
                        className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow"
                    >
                      <input
                          type="text"
                          placeholder="Search user..."
                          value={userSearchTerm}
                          onChange={handleUserSearch}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          className="p-2 w-full border-b outline-none"
                          disabled={isSubmitting}
                      />
                      <ul
                          onScroll={handleUserScroll}
                          className="max-h-40 overflow-auto"
                      >
                        {users.length === 0 && !loadingUsers ? (
                            <li className="px-4 py-2 text-sm text-gray-500">
                              {userSearchTerm ? "No users found" : "No users exist"}
                            </li>
                        ) : (
                            <>
                              {users.map((user) => (
                                  <li
                                      key={user.id}
                                      onClick={!isSubmitting ? () => handleUserSelect(user) : undefined}
                                      className={`px-4 py-2 hover:bg-gray-100 ${
                                          isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                                      }`}
                                  >
                                    {user.userName}
                                  </li>
                              ))}
                              {loadingUsers && (
                                  <li className="px-4 py-2 text-sm text-gray-500">
                                    {assignAssetStrings.addAssignAsset.select.loadingUsers}
                                  </li>
                              )}
                            </>
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
                  className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
              >
                {assignAssetStrings.addAssignAsset.buttons.close}
              </button>
              <button
                  type="submit"
                  className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
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

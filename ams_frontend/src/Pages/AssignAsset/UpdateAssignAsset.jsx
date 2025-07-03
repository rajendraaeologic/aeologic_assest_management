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

  const [noBranchesFound, setNoBranchesFound] = useState(false);
  const [noDeptsFound, setNoDeptsFound] = useState(false);
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [noAssetsFound, setNoAssetsFound] = useState(false);

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
  const { user } = useSelector((state) => state.auth);


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
      setNoBranchesFound(branches.length === 0 && search !== "");
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
      setNoDeptsFound(departments.length === 0 && search !== "");
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
      setNoUsersFound(users.length === 0 && search !== "");
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
        setNoAssetsFound(data.data.assets.length === 0 && search !== "");
        setAssets(prev =>
            page === 1 ? data.data.assets : [...prev, ...data.data.assets]
        );
        setAssetPage(page);
        setHasMoreAssets(page < data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching assets", error);
      setNoAssetsFound(true);
      toast.error("Failed to fetch assets");
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

  useEffect(() => {
    if (selectedAssignment) {
      reset({
        companyId: selectedAssignment.user?.company?.id,
        branchId: selectedAssignment.user?.branch?.id,
        departmentId: selectedAssignment.user?.department?.id,
        assetId: selectedAssignment.asset?.id,
        userId: selectedAssignment.user?.id,
      });



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
    setNoBranchesFound(false);
    setBranchSearchTerm(search);
    fetchBranches(1, search);
  };

  const handleBranchClick = async () => {
    if (!selectedOrgId) {
      toast.error("Please select an organization first");
      return;
    }
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
    setNoDeptsFound(false);
    setDeptSearchTerm(search);
    fetchDepartments(1, search);
  };

  const handleDeptClick = async () => {
    if (!branchId) {
      toast.error("Please select a branch first");
      return;
    }
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
    setNoAssetsFound(false);
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
    setNoUsersFound(false);
    setUserSearchTerm(search);
    fetchUsersByDepartmentId(1, search);
  };

  const handleUserSelect = (user) => {
    setValue("userId", user.id, { shouldValidate: true });
    setSelectedUser(user);
    setShowUserDropdown(false);
  };

  const hasChanges = (formData) => {
    if (!selectedAssignment) return false;

    return (
        formData.assetId !== selectedAssignment.asset?.id ||
        formData.userId !== selectedAssignment.user?.id
    );
  };

  const onSubmit = async (data) => {
    try {
      if (!user?.companyId) {
        toast.error("User organization not found", {
          position: "top-right",
          autoClose: 1000,
        });
        return;
      }

      if (!selectedAssignment || !selectedAssignment.id) {
        toast.error("Selected assignment is missing or invalid");
        return;
      }

      if (!data.assetId || !data.userId) {
        toast.error("Asset and user selection are required");
        return;
      }

      if (!hasChanges(data)) {
        toast.success("No changes made to the assignment", {
          position: "top-right",
          autoClose: 1000,
        });
        handleClose();
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
      await dispatch(updateAssignAsset(payload)).unwrap();
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

      if (error?.message) {
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

        toast.error(error.message, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

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

              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.updateAssignAsset.formLabels.branch}
                </label>
                <div
                    onClick={isSubmitting ? null : () => {
                      handleBranchClick();
                      if (!user?.companyId) {
                        toast.error("organization not found");
                        return;
                      }
                      setShowBranchDropdown(!showBranchDropdown);
                    }}
                    className={`mt-1 p-2 w-full border ${
                        errors.branchId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
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
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
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
                            {
                              assignAssetStrings.addAssignAsset.select
                                  .loadingBranches
                            }
                          </li>
                      )}
                      {noBranchesFound && !loadingBranches && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No branches found
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
                    onClick={isSubmitting ? null : () => {
                      handleDeptClick();
                      setShowDeptDropdown(!showDeptDropdown);
                    }}
                    className={`mt-1 p-2 w-full border ${
                        errors.departmentId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
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
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
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
                            {
                              assignAssetStrings.addAssignAsset.select
                                  .loadingDepartments
                            }
                          </li>
                      )}
                      {noDeptsFound && !loadingDepartments && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No departments found
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
                    onClick={isSubmitting ? null : () => {
                      if (!departmentId) {
                        toast.error("Please select a department first");
                        return;
                      }
                      setShowAssetDropdown(!showAssetDropdown);
                    }}
                    className={`mt-1 p-2 w-full border ${
                        errors.assetId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {selectedAsset
                    ? `${selectedAsset.assetName}`
                    : "Select Asset"}
                </div>

                {showAssetDropdown && !isSubmitting && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
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
                    />

                    <ul
                      onScroll={handleAssetScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {assets.map((asset) => {
                        const isUnassigned = asset.status === "UNASSIGNED";
                        const isCurrentAsset =
                          selectedAssignment?.asset?.id === asset.id;

                        const isDisabled = !isUnassigned && !isCurrentAsset;

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
                                {isCurrentAsset
                                  ? "(Current)"
                                  : `(${asset.status})`}
                              </span>
                            )}
                          </li>
                        );
                      })}
                      {loadingAssets && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            {
                              assignAssetStrings.addAssignAsset.select
                                  .loadingAssets
                            }
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
                    onClick={isSubmitting ? null : () => {
                      if (!departmentId) return;
                      setShowUserDropdown(!showUserDropdown);
                    }}
                    className={`mt-1 p-2 w-full border ${
                        errors.userId ? "border-red-500" : "border-gray-300"
                    } rounded-md cursor-pointer bg-white truncate ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
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
                {showUserDropdown && !isSubmitting && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
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
                            {
                              assignAssetStrings.addAssignAsset.select
                                  .loadingUsers
                            }
                          </li>
                      )}
                      {noUsersFound && !loadingUsers && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No Users found
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
                  className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

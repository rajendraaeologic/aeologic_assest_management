import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import userStrings from "../../locales/userStrings";
import { createUser, getAllUsers } from "../../Features/slices/userSlice";
import {USER_ROLES} from "../../TypeRoles/constants.roles.js";
import organizationStrings from "../../locales/organizationStrings.js";

const AddUserForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");

  const orgDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const [noOrgsFound, setNoOrgsFound] = useState(false);

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

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserRole = currentUser?.userRole;
  const currentUserCompanyId = currentUser?.companyId;
  const currentUserOrganizationName = currentUser?.organizationName;

  const { currentPage, rowsPerPage } = useSelector((state) => state.usersData);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      userName: "",
      phone: "",
      email: "",
      userRole: "",
      branchId: "",
      departmentId: "",
      companyId: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  const userName = watch("userName");
  const phone = watch("phone");
  const branchId = watch("branchId");

  // Fetch organizations
  const fetchOrganizations = async (page, search = "") => {
    if (currentUserRole !== USER_ROLES.SUPERADMIN) return;
    try {
      setOrgLoading(true);
      const response = await API.get(
          `/organization/getAllOrganizations?page=${page}&limit=5&searchTerm=${search}`
    );

      const {
        data: {
          data: { organizations, pagination },
        },
      } = response;
      setOrganizations((prev) =>
          page === 1 ? organizations : [...prev, ...organizations]
      );
      setNoOrgsFound(organizations.length === 0 && search !== "");
      setOrgPage(page);
      setHasMoreOrgs(page < pagination.totalPages);
    } catch (error) {
      toast.error("Error fetching organizations");
    } finally {
      setOrgLoading(false);
    }
  };
  // Fetch branches
  const fetchBranches = async (page, search = "") => {
    if (!selectedOrgId) return;
    try {
      setLoadingBranches(true);
      const response = await API.get(
        `/branch/${selectedOrgId}/branches?limit=5&page=${page}&searchTerm=${search}`
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
      toast.error("Error fetching branches");
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
      toast.error("Error fetching departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (selectedOrg) {
      setSelectedBranch(null);
      setSelectedDept(null);
    }
  }, [selectedOrg]);

  // useEffect(() => {
  //   if (branchId) {
  //     fetchDepartments(1, deptSearchTerm);
  //   }
  // }, [branchId, deptSearchTerm]);

  useEffect(() => {
    // Set initial organization based on user role
    if (currentUserRole !== USER_ROLES.SUPERADMIN) {
      if (currentUserCompanyId) {
        setValue("companyId", currentUserCompanyId);
        setSelectedOrg({
          id: currentUserCompanyId,
          organizationName: currentUserOrganizationName,
        });
        setSelectedOrgId(currentUserCompanyId);
      }
    }

    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentUserRole, currentUserCompanyId, currentUserOrganizationName]);

  // useEffect(() => {
  //   if (selectedOrgId) {
  //     setBranchSearchTerm("");
  //     setBranchPage(1);
  //     fetchBranches(1, "");
  //   }
  // }, [selectedOrgId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOrgDropdown && orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
        setShowOrgDropdown(false);
      }
      if (showBranchDropdown && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
      if (showDeptDropdown && deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
      }
    };
    if (showOrgDropdown || showBranchDropdown || showDeptDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOrgDropdown, showBranchDropdown, showDeptDropdown]);

  useEffect(() => {
    register("companyId", {
      required: userStrings.addUser.validation.organizationRequired,
    });
    register("branchId", {
      required: userStrings.addUser.validation.branchRequired,
    });
    register("departmentId", {
      required: userStrings.addUser.validation.departmentRequired,
    });
  }, [register]);

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
    setNoOrgsFound(false);
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
    setBranches([]);
    setDepartments([]);
    setSelectedBranch(null);
    setSelectedDept(null);
  };
  //
  // const handleOrgClick = async () => {
  //   // Only allow dropdown interaction for Superadmin
  //   if (currentUserRole === USER_ROLES.SUPERADMIN) {
  //     setShowOrgDropdown((prev) => !prev);
  //     if (searchTerm.trim() === "") await fetchOrganizations(1, "");
  //   }
  // };
    const handleOrgClick = async () => {
      // Only allow dropdown interaction for Superadmin
      if (currentUserRole === USER_ROLES.SUPERADMIN) {
        const shouldFetch = !showOrgDropdown; // Only fetch when opening the dropdown
        setShowOrgDropdown((prev) => !prev);

        if (shouldFetch && searchTerm.trim() === "") {
          await fetchOrganizations(1, "");
        }
      }
    };

  const handleBranchClick = async () => {
    if (!selectedOrgId) {
      toast.error("Please select an organization first");
      return;
    }

    const shouldFetch = !showBranchDropdown; // Only fetch when opening the dropdown
    setShowBranchDropdown((prev) => !prev);

    if (shouldFetch) {
      setBranchSearchTerm("");
      setBranchPage(1);
      setBranches([]);
      await fetchBranches(1, "");
    }
  }

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
    setDepartments([]);
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
    setDeptSearchTerm("");
  };
  const handleDeptClick = async () => {
    if (!branchId) {
      toast.error("Please select a branch first");
      return;
    }

    const shouldFetch = !showDeptDropdown; // Only fetch when opening the dropdown
    setShowDeptDropdown((prev) => !prev);

    if (shouldFetch) {
      setDeptSearchTerm("");
      setDepartmentPage(1);
      setDepartments([]);
      await fetchDepartments(1, "");
    }
  };

  const getRoleOptions = () => {
    switch (currentUserRole) {
      case USER_ROLES.ADMIN:
        return [
          { value: USER_ROLES.USER, label: "USER" },
          { value: USER_ROLES.MANAGER, label: "MANAGER" }
        ];
      case USER_ROLES.MANAGER:
        return [
          { value: USER_ROLES.USER, label: "USER" }
        ];
      case USER_ROLES.SUPERADMIN:
        return [
          { value: USER_ROLES.USER, label: "USER" },
          { value: USER_ROLES.MANAGER, label: "MANAGER" },
          { value: USER_ROLES.ADMIN, label: "ADMIN" }
        ];
      default:
        return [];
    }
  };
  console.log("Current user role:", currentUserRole);
  console.log("Role options:", getRoleOptions());

  const onSubmit = async (data) => {
    try {
      await dispatch(createUser(data)).unwrap();
      await dispatch(
        getAllUsers({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();
      toast.success(userStrings.addUser.toast.success, {
        position: "top-right",
        autoClose: 2000,
      });
      handleClose();
    } catch (error) {
      const errorMessage = error?.message || "";

      if (errorMessage.includes("This user has been deleted")) {
        toast.info("This email is linked to a previously removed account(User). Please contact SuperAdmin if you need help restoring access.", {
          autoClose: 3000,
          position: "top-right"
        });
        return setError("email", {
          type: "manual",
          message: userStrings.addUser.toast.emailTaken,
        });
      }

      if (errorMessage.includes("Email already taken")) {
        toast.error(userStrings.addUser.toast.emailTaken, { autoClose: 2000 });
        return setError("email", {
          type: "manual",
          message: userStrings.addUser.toast.emailTaken,
        });
      }

      if (errorMessage.includes("Phone already taken")) {
        toast.error(userStrings.addUser.toast.phoneTaken, { autoClose: 2000 });
        return setError("phone", {
          type: "manual",
          message: userStrings.addUser.toast.phoneTaken,
        });
      }
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
            {userStrings.addUser.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Name */}
              <div className="w-full">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.addUser.formLabels.userName}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  ref={firstInputRef}
                  {...register("userName", {
                    required: userStrings.addUser.validation.userNameRequired,
                    minLength: {
                      value: 3,
                      message: userStrings.addUser.validation.userNameMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message: userStrings.addUser.validation.userNameMaxLength,
                    },
                    pattern: {
                      value: /^[a-zA-Z ]+$/,
                      message: userStrings.addUser.validation.userNamePattern,
                    },
                    validate: (value) => {
                      const trimmed = value.trim();
                      if (value !== trimmed) {
                        return userStrings.addUser.validation.trimSpaces;
                      }
                      return true;
                    },
                  })}
                  type="text"
                  maxLength={25}
                  id="userName"
                  disabled={isSubmitting}
                  placeholder={userStrings.addUser.placeholders.userName}
                  className={`mt-1 p-2 w-full border ${
                      errors.userName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userName.message}
                  </p>
                )}
                {userName.length > 25 && (
                  <p className="text-red-500  text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="w-full">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.addUser.formLabels.phone}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  {...register("phone", {
                    required: userStrings.addUser.validation.phoneRequired,
                    maxLength: {
                      value: 10,
                      message: userStrings.addUser.validation.phoneMaxLength,
                    },
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: userStrings.addUser.validation.phoneInvalid,
                    },
                    validate: (value) => {
                      if (/^0{10}$/.test(value)) {
                        return "Phone number can't be all zeros.";
                      }
                      return true;
                    }
                  })}
                  type="tel"
                  maxLength={10}
                  id="phoneNumber"
                  disabled={isSubmitting}
                  placeholder={userStrings.addUser.placeholders.phone}
                  className={`mt-1 p-2 w-full border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
                {phone.length > 10 && (
                  <p className="text-red-500  text-sm mt-1">
                    Maximum 10 Numbers allowed
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.addUser.formLabels.email}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  {...register("email", {
                    required: userStrings.addUser.validation.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: userStrings.addUser.validation.emailInvalid,
                    },
                  })}
                  type="text"
                  id="email"
                  disabled={isSubmitting}
                  placeholder={userStrings.addUser.placeholders.email}
                  className={`mt-1 p-2 w-full border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Organization Field - Conditional Rendering */}
              {currentUserRole === USER_ROLES.SUPERADMIN ? (
                  <div className="w-full relative">
                    <label className="block text-sm font-medium text-gray-700">
                      {userStrings.addUser.formLabels.organization}
                      <span className="text-red-500">*</span>
                    </label>

                    <div
                        onClick={!isSubmitting ? handleOrgClick : undefined}
                        className={`mt-1 p-2 w-full border ${
                            errors.companyId ? "border-red-500" : "border-gray-300"
                        } rounded-md cursor-pointer bg-white truncate disabled:opacity-70 disabled:cursor-not-allowed ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                      {selectedOrg?.organizationName || "Select Organization"}
                    </div>

                    {errors.companyId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyId.message}
                        </p>
                    )}

                    {showOrgDropdown &&   !isSubmitting && (
                        <div
                            ref={orgDropdownRef}
                            className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                          <input
                              type="text"
                              placeholder="Search organization..."
                              value={searchTerm}
                              onChange={handleOrgSearch}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                }
                              }}
                              className="p-2 w-full border-b outline-none"
                          />
                          <ul onScroll={handleOrgScroll} className="max-h-40 overflow-auto">
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
                                <li className="px-4 py-2 text-sm text-gray-500">Loading...</li>
                            )}
                            {noOrgsFound && !orgLoading && (
                                <li className="px-4 py-2 text-sm text-gray-500">
                                  No organizations found
                                </li>
                            )}
                          </ul>
                        </div>
                    )}
                  </div>
              ) : (
                  <input
                      type="hidden"
                      {...register("companyId")}
                      value={currentUserCompanyId}
                  />
              )}


              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.addUser.formLabels.branch}
                  <span className="text-red-500">*</span>
                </label>

                <div
                    onClick={!isSubmitting ? () => {
                      handleBranchClick();
                      if (!selectedOrgId) {
                        toast.error("Please select an organization first");
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
                  {selectedBranch?.branchName || "Select Branch"}
                </div>
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
                            </>
                        )}
                      </ul>
                    </div>
                )}
                {errors.branchId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.branchId.message}
                    </p>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.addUser.formLabels.department}
                  <span className="text-red-500">*</span>
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
                  {selectedDept?.departmentName || "Select Department"}
                </div>
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
                            </>
                        )}
                      </ul>
                    </div>
                )}
                {errors.departmentId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.departmentId.message}
                    </p>
                )}
              </div>


              {/* User Role */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.addUser.formLabels.role}
                  <span className="text-red-500">*</span>
                </label>

                <select
                    {...register("userRole", {
                      required: userStrings.addUser.validation.roleRequired,
                      validate: (value) => {
                        if (currentUserRole === USER_ROLES.ADMIN && value === USER_ROLES.ADMIN) {
                          return "You cannot create an admin user";
                        }
                        if (currentUserRole === USER_ROLES.MANAGER && value === USER_ROLES.MANAGER) {
                          return "You cannot create a manager user";
                        }
                        return true;
                      }
                    })}
                    disabled={isSubmitting}
                    className={`mt-1 p-2 w-full border ${
                        errors.userRole ? "border-red-500" : "border-gray-300"
                    } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>{userStrings.addUser.select.roleDefault}</option>
                  {getRoleOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                  ))}
                </select>

                {errors.userRole && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userRole.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.addUser.formLabels.status}
                  <span className="text-red-500">*</span>
                </label>

                <select
                    disabled={isSubmitting}
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                    {...register("status", {
                      required: userStrings.addUser.validation.statusRequired,
                    })}
                >
                  <option value="ACTIVE">
                    {userStrings.addUser.select.statusActive}
                  </option>
                  <option value="IN_ACTIVE">
                    {userStrings.addUser.select.statusInactive}
                  </option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </p>
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
                {userStrings.addUser.buttons.close}
              </button>
              <button
                  type="submit"
                  className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
              >
                {isSubmitting
                  ? userStrings.addUser.buttons.saving
                  : userStrings.addUser.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;

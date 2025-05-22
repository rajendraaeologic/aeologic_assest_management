import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import userStrings from "../../locales/userStrings";
import { getAllUsers, updateUser } from "../../Features/slices/userSlice";

const UpdateUserForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const selectedUser = useSelector((state) => state.usersData.selectedUser);
  const { currentPage, rowsPerPage } = useSelector((state) => state.usersData);

  const [noOrgsFound, setNoOrgsFound] = useState(false);
  const [noBranchesFound, setNoBranchesFound] = useState(false);
  const [noDeptsFound, setNoDeptsFound] = useState(false);

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
  const [selectedOrgId, setSelectedOrgId] = useState("");

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
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      userName: "",
      phone: "",
      email: "",
      userRole: "",
      status: "ACTIVE",
      branchId: "",
      departmentId: "",
      companyId: "",
    },
    mode: "onChange",
  });

  const userName = watch("userName");
  const phone = watch("phone");
  const email = watch("email");
  const userRole = watch("userRole");
  const status = watch("status");
  const branchId = watch("branchId");
  const departmentId = watch("departmentId");

  // Fetch organizations
  const fetchOrganizations = async (page, search = "") => {
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
      setNoOrgsFound(organizations.length === 0 && search !== "");
      setOrganizations((prev) =>
          page === 1 ? organizations : [...prev, ...organizations]
      );

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
      setNoBranchesFound(branches.length === 0 && search !== "");
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
      setNoDeptsFound(departments.length === 0 && search !== "");
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
    fetchOrganizations(1, "");
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Set organization
      if (selectedUser.company) {
        setSelectedOrg(selectedUser.company);
        setSelectedOrgId(selectedUser.company.id);
        setValue("companyId", selectedUser.company.id);
      }

      // Set branch
      if (selectedUser.branch) {
        setSelectedBranch(selectedUser.branch);
        setValue("branchId", selectedUser.branch.id);
      }

      // Set department
      if (selectedUser.department) {
        setSelectedDept(selectedUser.department);
        setValue("departmentId", selectedUser.department.id);
      }

      reset({
        userName: selectedUser.userName || "",
        phone: selectedUser.phone || "",
        email: selectedUser.email || "",
        userRole: selectedUser.userRole || "",
        status: selectedUser.status || "ACTIVE",
        companyId: selectedUser.company?.id || "",
        branchId: selectedUser.branch?.id || "",
        departmentId: selectedUser.department?.id || "",
      });
    }
  }, [selectedUser, reset, setValue]);

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

  // Organization dropdown handlers
  const handleOrgScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !orgLoading && hasMoreOrgs) {
      fetchOrganizations(orgPage + 1, searchTerm);
    }
  };

  const handleOrgSearch = (e) => {
    const search = e.target.value;
    setNoOrgsFound(false);
    setSearchTerm(search);
    fetchOrganizations(1, search);
  };

  const handleOrgClick = () => {
    setShowOrgDropdown(!showOrgDropdown);
    if (!showOrgDropdown && searchTerm === "") {
      fetchOrganizations(1, "");
    }
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

  // Branch dropdown handlers
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
    setDepartments([]);
    setSelectedDept(null);
    setDeptSearchTerm("");
    setDepartmentPage(1);
  };

  // Department dropdown handlers
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

  useEffect(() => {
    register("branchId", {
      required: userStrings.updateUser.validation.branchRequired,
    });
    register("departmentId", {
      required: userStrings.updateUser.validation.departmentRequired,
    });
    register("companyId", {
      required: userStrings.updateUser.validation.organizationRequired,
    });
  }, [register]);

  const onSubmit = async (data) => {
    if (!selectedOrg) {
      toast.error("Please select an organization");
      return;
    }
    if (!data.branchId) {
      toast.error("Please select a branch");
      return;
    }
    if (!data.departmentId) {
      toast.error("Please select a department");
      return;
    }

    try {
      const userData = {
        params: { userId: selectedUser.id },
        body: {
          userName: data.userName,
          phone: data.phone,
          email: data.email,
          userRole: data.userRole,
          status: data.status,
          branchId: data.branchId,
          departmentId: data.departmentId,
          companyId: selectedOrg.id,
        },
      };

      await dispatch(updateUser(userData)).unwrap();
      await dispatch(
        getAllUsers({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();

      toast.success(userStrings.updateUser.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      const errorMessage = error?.message || "";
      if (errorMessage.includes("Email already taken")) {
        toast.error(userStrings.updateUser.toast.emailTaken);
        return;
      }
      if (errorMessage.includes("Phone already taken")) {
        toast.error(userStrings.updateUser.toast.phoneTaken);
        return;
      }
      toast.error(errorMessage || userStrings.updateUser.toast.error, {
        position: "top-right",
        autoClose: 1500,
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
            {userStrings.updateUser.title}
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
                  {userStrings.updateUser.formLabels.userName}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  maxLength={25}
                  id="userName"
                  type="text"
                  className={`mt-1 p-2 w-full border ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("userName", {
                    required:
                      userStrings.updateUser.validation.userNameRequired,
                    minLength: {
                      value: 3,
                      message:
                        userStrings.updateUser.validation.userNameMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message:
                        userStrings.updateUser.validation.userNameMaxLength,
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9 ]+$/,
                      message:
                        userStrings.updateUser.validation.userNamePattern,
                    },
                  })}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userName.message}
                  </p>
                )}
                {userName?.length === 25 && (
                  <p className="text-red-500 text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="w-full">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.updateUser.formLabels.phone}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  id="phone"
                  className={`mt-1 p-2 w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("phone", {
                    required: userStrings.updateUser.validation.phoneRequired,
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: userStrings.updateUser.validation.phoneInvalid,
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.updateUser.formLabels.email}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`mt-1 p-2 w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("email", {
                    required: userStrings.updateUser.validation.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: userStrings.updateUser.validation.emailInvalid,
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Organization Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.organization}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleOrgClick}
                  className={`mt-1 p-2 w-full border ${
                    errors.companyId ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                  {selectedOrg?.organizationName || "Select Organization"}
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
                      {noOrgsFound && !orgLoading && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No organizations found
                          </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Branch Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.branch}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleBranchClick}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
                >
                  {selectedBranch?.branchName || "Select Branch"}
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
                  {userStrings.updateUser.formLabels.department}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleDeptClick}
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
                >
                  {selectedDept?.departmentName || "Select Department"}
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
                      {noDeptsFound && !loadingDepartments && (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No departments found
                          </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* User Role */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.userRole}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className={`mt-1 p-2 w-full border ${
                    errors.userRole ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("userRole", {
                    required:
                      userStrings.updateUser.validation.userRoleRequired,
                  })}
                >
                  <option value="">Select Role</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="USER">USER</option>
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
                  {userStrings.updateUser.formLabels.status}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("status", {
                    required: userStrings.updateUser.validation.statusRequired,
                  })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_ACTIVE">IN_ACTIVE</option>
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
                {userStrings.updateUser.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? userStrings.updateUser.buttons.updating
                  : userStrings.updateUser.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserForm;

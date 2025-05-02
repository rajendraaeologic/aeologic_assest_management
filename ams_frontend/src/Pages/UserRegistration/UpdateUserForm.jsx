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
  console.log("sbnsjs", selectedUser);

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
  } = useForm({
    defaultValues: {
      userName: "",
      phone: "",
    },
    mode: "onChange",
  });
  const userName = watch("userName");
  const phone = watch("phone");

  const branchId = watch("branchId");
  const selectedOrgId = watch("companyId");

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
      toast.error("Error fetching organizations");
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
      toast.error("Error fetching branches");
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
      toast.error("Error fetching departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (selectedOrg) {
      setValue("branchId", "");
      setValue("departmentId", "");
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (branchId) {
      setValue("departmentId", "");
    }
  }, [branchId]);

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
      reset({
        userName: selectedUser.userName,
        phone: selectedUser.phone,
        email: selectedUser.email,
        userRole: selectedUser.userRole,
        status: selectedUser.status,
        companyId: selectedUser.company?.id,
        branchId: selectedUser.branch?.id,
        departmentId: selectedUser.department?.id,
      });

      if (selectedUser.company) {
        setSelectedOrg(selectedUser.company);

        setOrganizations((prev) =>
          prev.some((org) => org.id === selectedUser.company.id)
            ? prev
            : [...prev, selectedUser.company]
        );
      }

      if (selectedUser.branch) {
        setSelectedBranch(selectedUser.branch);

        setBranches((prev) =>
          prev.some((b) => b.id === selectedUser.branch.id)
            ? prev
            : [...prev, selectedUser.branch]
        );
      }

      if (selectedUser.department) {
        setSelectedDept(selectedUser.department);

        setDepartments((prev) =>
          prev.some((d) => d.id === selectedUser.department.id)
            ? prev
            : [...prev, selectedUser.department]
        );
      }
    }
  }, [selectedUser, branchId, reset]);

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

  const handleOrgClick = () => {
    setShowOrgDropdown(!showOrgDropdown);
    if (!showOrgDropdown) {
      fetchOrganizations(1, searchTerm);
    }
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setValue("companyId", org.id);
    setShowOrgDropdown(false);
    setSearchTerm("");
    setValue("branchId", "");
    setValue("departmentId", "");
    setBranches([]);
    setDepartments([]);
    setSelectedBranch(null);
    setSelectedDept(null);
  };

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

  const handleBranchClick = () => {
    if (!selectedOrgId) {
      toast.error("Please select an organization first");
      return;
    }
    setShowBranchDropdown(!showBranchDropdown);
    if (!showBranchDropdown) {
      fetchBranches(1, branchSearchTerm);
    }
  };

  const handleBranchSelect = (branch) => {
    console.log("sns", branch.id);
    setValue("branchId", branch.id);
    setSelectedBranch(branch);
    setShowBranchDropdown(false);
    setValue("departmentId", "");
    setDepartments([]);
    setSelectedDept(null);
    setDeptSearchTerm("");
    setDepartmentPage(1);
  };

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
  const handleDeptClick = () => {
    if (!branchId) {
      toast.error("Please select a branch first");
      return;
    }
    setShowDeptDropdown(!showDeptDropdown);
    if (!showDeptDropdown) {
      fetchDepartments(1, deptSearchTerm);
    }
  };
  const onSubmit = async (data) => {
    console.log("dataabvhab", data);
    try {
      const userData = {
        params: { userId: selectedUser.id },
        body: {
          userName: data.userName,
          phone: data.phone,
          email: data.email,
          userRole: data.userRole,
          branchId: data.branchId,
          departmentId: data.departmentId,
          companyId: data.companyId,
          status: data.status,
        },
      };

      await dispatch(updateUser(userData)).unwrap();
      dispatch(getAllUsers());

      toast.success(userStrings.updateUser.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      const errorMessage = error?.message || "";

      if (errorMessage.includes("Email already taken")) {
        toast.error(userStrings.updateUser.toast.emailTaken, {
          autoClose: 2000,
        });
        return;
      }

      if (errorMessage.includes("Phone already taken")) {
        toast.error(userStrings.updateUser.toast.phoneTaken, {
          autoClose: 2000,
        });
        return;
      }

      toast.error(userStrings.updateUser.toast.error, {
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
            {userStrings.updateUser.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("companyId")} />
            <input type="hidden" {...register("branchId")} />
            <input type="hidden" {...register("departmentId")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Name */}
              <div className="w-full">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.updateUser.formLabels.userName}
                </label>
                <input
                  ref={firstInputRef}
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
                  })}
                  type="text"
                  maxLength={25}
                  id="userName"
                  className={`mt-1 p-2 w-full border ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userName.message}
                  </p>
                )}
                {userName.length === 25 && (
                  <p className="text-red-500  text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="w-full">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userStrings.updateUser.formLabels.phone}
                </label>
                <input
                  {...register("phone", {
                    required: userStrings.updateUser.validation.phoneRequired,
                    minLength: {
                      value: 7,
                      message: userStrings.updateUser.validation.phoneMinLength,
                    },
                    maxLength: {
                      value: 10,
                      message: userStrings.updateUser.validation.phoneMaxLength,
                    },
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: userStrings.updateUser.validation.phoneInvalid,
                    },
                  })}
                  type="tel"
                  id="phoneNumber"
                  maxLength={10}
                  className={`mt-1 p-2 w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
                {phone.length === 25 && (
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
                  {userStrings.updateUser.formLabels.email}
                </label>
                <input
                  {...register("email", {
                    required: userStrings.updateUser.validation.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: userStrings.updateUser.validation.emailInvalid,
                    },
                  })}
                  type="email"
                  id="email"
                  className={`mt-1 p-2 w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.organization}
                </label>
                <div
                  onClick={handleOrgClick}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : "Select Organization"}
                </div>
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

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.branch}
                </label>
                <div
                  onClick={handleBranchClick}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedBranch ? selectedBranch.branchName : "Select Branch"}
                </div>
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
                {errors.branchId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchId.message}
                  </p>
                )}
              </div>

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.department}
                </label>
                <div
                  onClick={handleDeptClick}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedDept
                    ? selectedDept.departmentName
                    : "Select Department"}
                </div>
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
                          onClick={() => {
                            setValue("departmentId", dept.id);
                            setSelectedDept(dept);
                            setShowDeptDropdown(false);
                          }}
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
                {errors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.userRole}
                </label>
                <select
                  {...register("userRole", {
                    required:
                      userStrings.updateUser.validation.userRoleRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.userRole ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">
                    {userStrings.updateUser.select.roleDefault}
                  </option>
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

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.status}
                </label>
                <select
                  {...register("status", {
                    required: userStrings.updateUser.validation.statusRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="ACTIVE">
                    {userStrings.updateUser.select.statusActive}
                  </option>
                  <option value="INACTIVE">
                    {userStrings.updateUser.select.statusInactive}
                  </option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
            <hr className="mt-4"></hr>
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

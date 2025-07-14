import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { createDepartment } from "../../Features/slices/departmentSlice";
import departmentStrings from "../../locales/departmentStrings";
import API from "../../App/api/axiosInstance";
import { getAllDepartments } from "../../Features/slices/departmentSlice";
import { USER_ROLES } from "../../TypeRoles/constants.roles.js";
import organizationStrings from "../../locales/organizationStrings.js";

const AddDepartment = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const orgDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Organization dropdown state
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgSearchTerm, setOrgSearchTerm] = useState("");

  // Branch dropdown state
  const [branchPage, setBranchPage] = useState(1);
  const [hasMoreBranches, setHasMoreBranches] = useState(true);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserRole = currentUser?.userRole;
  const currentUserCompanyId = currentUser?.companyId;
  const currentUserOrganizationName = currentUser?.organizationName;

  const { currentPage, rowsPerPage } = useSelector(
      (state) => state.departmentData
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    reset,
  } = useForm({
    defaultValues: {
      departmentName: "",
      branchId: "",
      companyId: "",
    },
    mode: "onChange",
  });

  const departmentName = watch("departmentName");
  const companyId = watch("companyId");

  // Register fields
  useEffect(() => {
    register("branchId", {
      required: departmentStrings.addDepartment.validation.branchRequired,
    });
    register("companyId", {
      required: "Organization is required",
    });
  }, [register]);

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
      setOrgPage(page);
      setHasMoreOrgs(page < pagination.totalPages);
    } catch (error) {
      toast.error("Error fetching organizations");
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOrgDropdown && orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
        setShowOrgDropdown(false);
      }
      if (showBranchDropdown && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };
    if (showOrgDropdown || showBranchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOrgDropdown, showBranchDropdown]);


  // Organization handlers
  const handleOrgScroll = (e) => {
    const bottomReached =
        e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !orgLoading && hasMoreOrgs) {
      fetchOrganizations(orgPage + 1, orgSearchTerm);
    }
  };

  const handleOrgSearch = (e) => {
    const search = e.target.value;
    setOrgSearchTerm(search);
    fetchOrganizations(1, search);
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setValue("companyId", org.id, { shouldValidate: true });
    setShowOrgDropdown(false);
    setOrgSearchTerm("");
    // Reset branch selection when organization changes
    setSelectedBranch(null);
    setValue("branchId", "");
    setBranches([]);
  };

  const handleOrgClick = async () => {
    // Only allow dropdown interaction for Superadmin
    if (currentUserRole === USER_ROLES.SUPERADMIN) {
      setShowOrgDropdown((prev) => !prev);
      if (orgSearchTerm.trim() === "") await fetchOrganizations(1, "");
    }
  };

  // Fetch branches based on selected organization
  const fetchBranches = async (page, search = "") => {
    const orgId = currentUserRole === USER_ROLES.SUPERADMIN ? companyId : currentUserCompanyId;
    if (!orgId) return;
    try {
      setLoadingBranches(true);
      const response = await API.get(
          `/branch/${orgId}/branches?limit=5&page=${page}&searchTerm=${search}`
      );
      const {
        data: {
          data: { branches, pagination },
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

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    // Set initial organization based on user role
    if (currentUserRole !== USER_ROLES.SUPERADMIN) {
      if (currentUserCompanyId) {
        setValue("companyId", currentUserCompanyId);
        setSelectedOrg({
          id: currentUserCompanyId,
          organizationName: currentUserOrganizationName,
        });
      }
    } else {
      fetchOrganizations(1, "");
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentUserRole, currentUserCompanyId, currentUserOrganizationName]);

  useEffect(() => {
    if (companyId) {
      setBranchSearchTerm("");
      setBranchPage(1);
      fetchBranches(1, "");
    }
  }, [companyId]);

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
    if (!companyId) {
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
  };

  const onSubmit = async (data) => {
    try {
      if (currentUserRole === USER_ROLES.SUPERADMIN && !data.companyId) {
        toast.error("Please select an organization", {
          position: "top-right",
          autoClose: 1500,
        });
        return;
      }

      if (!data.branchId) {
        toast.error("Please select a branch", {
          position: "top-right",
          autoClose: 1500,
        });
        return;
      }

      await dispatch(
          createDepartment({
            departmentName: data.departmentName,
            branchId: data.branchId,
          })
      ).unwrap();

      await dispatch(
          getAllDepartments({
            page: currentPage,
            limit: rowsPerPage,
          })
      ).unwrap();
      toast.success(departmentStrings.addDepartment.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });
      handleClose();
    } catch (error) {
      if (error?.status === 409) {
        setError("departmentName", {
          type: "manual",
          message: error.message,
        });
        return;
      }

      toast.error(
          error.message ||
          departmentStrings.addDepartment.toast.error || {
            position: "top-right",
            autoClose: 1500,
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
            className={`mt-[20px] w-[400px] min-h-80 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
                isVisible ? "scale-100" : "scale-95"
            }`}
        >
          <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
            <h2 className="text-[17px] font-semibold text-white">
              {departmentStrings.addDepartment.title}
            </h2>
            <button onClick={handleClose} className="text-white rounded-md">
              <IoClose className="h-7 w-7" />
            </button>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-1 gap-4">
                {/* Organization Field - Conditional Rendering */}
                {currentUserRole === USER_ROLES.SUPERADMIN ? (
                    <div className="w-full relative">
                      <label className="block text-sm font-medium text-gray-700">
                        Organization
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                          onClick={!isSubmitting ? handleOrgClick : undefined}
                          className={`mt-1 p-2 w-full border ${
                              errors.companyId ? "border-red-500" : "border-gray-300"
                          } rounded-md cursor-pointer bg-white truncate ${
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
                      {showOrgDropdown && !isSubmitting && (
                          <div
                              ref={orgDropdownRef}
                              className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow"
                          >
                            <input
                                type="text"
                                placeholder="Search organization..."
                                value={orgSearchTerm}
                                onChange={handleOrgSearch}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                  }
                                }}
                                className="p-2 w-full border-b outline-none"
                            />
                            <ul onScroll={handleOrgScroll} className="max-h-40 overflow-auto">
                              {organizations.length === 0 && !orgLoading ? (
                                  <li className="px-4 py-2 text-sm text-gray-500">
                                    {orgSearchTerm ? "No organizations found" : "No organizations exist"}
                                  </li>
                              ) : (
                                  <>
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
                                  </>
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

                <div className="w-full">
                  <label
                      htmlFor="departmentName"
                      className="block text-sm font-medium text-gray-700"
                  >
                    {departmentStrings.addDepartment.formLabels.departmentName}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      ref={firstInputRef}
                      {...register("departmentName", {
                        required: departmentStrings.addDepartment.validation.departmentNameRequired,
                        minLength: {
                          value: 3,
                          message: departmentStrings.addDepartment.validation.departmentNameMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: departmentStrings.addDepartment.validation.departmentNameMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: departmentStrings.addDepartment.validation.deptNamePattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return departmentStrings.addDepartment.validation.trimSpaces;
                          }
                          if (/^0{25}$/.test(value)) {
                            return "Department Name cannot be all zeros.";
                          }
                          return true;
                        },
                      })}
                      type="text"
                      maxLength={25}
                      id="departmentName"
                      disabled={isSubmitting}
                      placeholder={departmentStrings.addDepartment.placeholders.departmentName}
                      className={`mt-1 p-2 w-full border ${
                          errors.departmentName ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.departmentName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.departmentName.message}
                      </p>
                  )}
                </div>

                <div className="w-full relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {departmentStrings.addDepartment.formLabels.selectBranch}
                    <span className="text-red-500">*</span>
                  </label>
                  <div
                      onClick={!isSubmitting ? handleBranchClick : undefined}
                      className={`mt-1 p-2 w-full border ${
                          errors.branchId ? "border-red-500" : "border-gray-300"
                      } rounded-md cursor-pointer bg-white truncate ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={!companyId || isSubmitting}
                  >
                    {selectedBranch ? selectedBranch.branchName : "Select Branch"}
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
              </div>

              <hr className="mt-4" />
              <div className="flex justify-end gap-4 mt-6 mb-2 mr-5">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                  {departmentStrings.addDepartment.buttons.close}
                </button>
                <button
                    type="submit"
                    className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                  {isSubmitting
                      ? departmentStrings.addDepartment.buttons.saving
                      : departmentStrings.addDepartment.buttons.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AddDepartment;
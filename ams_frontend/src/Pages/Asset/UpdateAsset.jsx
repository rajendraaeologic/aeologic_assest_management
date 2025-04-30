import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { updateAsset } from "../../Features/slices/assetSlice";
import API from "../../App/api/axiosInstance";
import assetStrings from "../../locales/assetStrings";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const UpdateAsset = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const { loading, error } = useSelector((state) => state.assetUserData);
  const selectedAsset = useSelector(
    (state) => state.assetUserData.selectedAsset
  );

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
      assetName: "",
      uniqueId: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      status: "ACTIVE",
      branchId: "",
      departmentId: "",
      companyId: "",
    },
  });

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");

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

  // Initialize component
  useEffect(() => {
    fetchOrganizations(1, "");
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Set initial values when selectedAsset changes
  useEffect(() => {
    if (selectedAsset) {
      // Set the organization if available
      if (selectedAsset.company) {
        setSelectedOrg(selectedAsset.company);
        setSelectedOrgId(selectedAsset.company.id);
        setValue("companyId", selectedAsset.company.id);
      }

      // Set the branch if available
      if (selectedAsset.branch) {
        setSelectedBranch(selectedAsset.branch);
        setValue("branchId", selectedAsset.branch.id);
      }

      // Set the department if available
      if (selectedAsset.department) {
        setSelectedDept(selectedAsset.department);
        setValue("departmentId", selectedAsset.department.id);
      }

      reset({
        assetName: selectedAsset.assetName || "",
        uniqueId: selectedAsset.uniqueId || "",
        brand: selectedAsset.brand || "",
        model: selectedAsset.model || "",
        serialNumber: selectedAsset.serialNumber || "",
        status: selectedAsset.status || "ACTIVE",
        description: selectedAsset.description || "",
        branchId: selectedAsset.branch?.id || "",
        departmentId: selectedAsset.department?.id || "",
        companyId: selectedAsset.company?.id || "",
      });
    }
  }, [selectedAsset, reset, setValue]);

  // Fetch branches when organization changes
  useEffect(() => {
    if (selectedOrgId) {
      setBranchSearchTerm("");
      setBranchPage(1);
      fetchBranches(1, "");
    }
  }, [selectedOrgId]);

  // Fetch departments when branch changes
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
    setBranchSearchTerm(search);
    fetchBranches(1, search);
  };

  const handleBranchClick = () => {
    if (!selectedOrgId) {
      toast.error("Please select an organization first");
      return;
    }
    setShowBranchDropdown(!showBranchDropdown);
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
    setDeptSearchTerm(search);
    fetchDepartments(1, search);
  };

  const handleDeptClick = () => {
    if (!branchId) {
      toast.error("Please select a branch first");
      return;
    }
    setShowDeptDropdown(!showDeptDropdown);
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
      required: assetStrings.updateAsset.validation.branchRequired,
    });
    register("departmentId", {
      required: assetStrings.updateAsset.validation.departmentRequired,
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
      const updateData = {
        params: { assetId: selectedAsset.id },
        body: {
          assetName: data.assetName,
          uniqueId: data.uniqueId,
          brand: data.brand,
          model: data.model,
          serialNumber: data.serialNumber,
          status: data.status,
          description: data.description,
          branchId: data.branchId,
          departmentId: data.departmentId,
          companyId: selectedOrg.id,
        },
      };

      await dispatch(updateAsset(updateData)).unwrap();
      toast.success(assetStrings.updateAsset.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || assetStrings.updateAsset.toast.error, {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  return (
    <div
      className={`fixed overflow-scroll inset-0 px-1 md:px-0 bg-black bg-opacity-50 z-50 flex justify-center items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`mt-[20px] w-[620px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {assetStrings.updateAsset.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-5 px-10">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Name */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.assetName}
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  className={`mt-1 p-2 w-full border ${
                    errors.assetName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  placeholder={assetStrings.updateAsset.placeholders.assetName}
                  {...register("assetName", {
                    required:
                      assetStrings.updateAsset.validation.assetNameRequired,
                  })}
                />
                {errors.assetName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.assetName.message}
                  </p>
                )}
              </div>

              {/* Unique ID */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.uniqueId}
                </label>
                <input
                  type="text"
                  className={`mt-1 p-2 w-full border ${
                    errors.uniqueId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  placeholder={assetStrings.updateAsset.placeholders.uniqueId}
                  {...register("uniqueId", {
                    required:
                      assetStrings.updateAsset.validation.uniqueIdRequired,
                  })}
                />
                {errors.uniqueId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.uniqueId.message}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.brand}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.updateAsset.placeholders.brand}
                  {...register("brand", {
                    required: assetStrings.updateAsset.validation.brandRequired,
                  })}
                />
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.brand.message}
                  </p>
                )}
              </div>

              {/* Model */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.model}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.updateAsset.placeholders.model}
                  {...register("model", {
                    required: assetStrings.updateAsset.validation.modelRequired,
                  })}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.model.message}
                  </p>
                )}
              </div>

              {/* Serial Number */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.serialNumber}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={
                    assetStrings.updateAsset.placeholders.serialNumber
                  }
                  {...register("serialNumber", {
                    required:
                      assetStrings.updateAsset.validation.serialNumberRequired,
                  })}
                />
                {errors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.serialNumber.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.status}
                </label>
                <select
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  {...register("status", {
                    required:
                      assetStrings.updateAsset.validation.statusRequired,
                  })}
                >
                  <option value="ACTIVE">
                    {assetStrings.updateAsset.statusOptions.ACTIVE}
                  </option>
                  <option value="IN_USE">
                    {assetStrings.updateAsset.statusOptions.IN_USE}
                  </option>
                  <option value="UNDER_MAINTENANCE">
                    {assetStrings.updateAsset.statusOptions.UNDER_MAINTENANCE}
                  </option>
                  <option value="RETIRED">
                    {assetStrings.updateAsset.statusOptions.RETIRED}
                  </option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.description}
                </label>
                <textarea
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  rows={2}
                  placeholder={
                    assetStrings.updateAsset.placeholders.description
                  }
                  {...register("description", {
                    required:
                      assetStrings.updateAsset.validation.descriptionRequired,
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Organization Dropdown */}
              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  Organization <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleOrgClick}
                  className={`mt-1 p-2 w-full border ${
                    !selectedOrg ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : "Select Organization"}
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
                  Branch <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleBranchClick}
                  className={`mt-1 p-2 w-full border ${
                    !selectedBranch ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
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
                  Department <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleDeptClick}
                  className={`mt-1 p-2 w-full border ${
                    !selectedDept ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
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
            </div>

            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {assetStrings.updateAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? assetStrings.updateAsset.buttons.updating
                  : assetStrings.updateAsset.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAsset;

import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { createAsset } from "../../Features/slices/assetSlice";
import API from "../../App/api/axiosInstance";
import assetStrings from "../../locales/assetStrings";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
const AddAsset = ({ onClose, onSuccess }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.assetUserData);

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
    formState: { errors },
    watch,
    setValue,
    setError,
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
    setBranches([]);
    setDepartments([]);
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
      required: assetStrings.addAsset.validation.branchRequired,
    });
    register("departmentId", {
      required: assetStrings.addAsset.validation.departmentRequired,
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
      await dispatch(createAsset(data)).unwrap();
      toast.success(assetStrings.addAsset.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      if (error.response?.status === 409) {
        setError("assetName", {
          type: "manual",
          message: error.message,
        });
        return;
      }

      const errorMessage = error.message || assetStrings.addAsset.toast.error;
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1500,
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
            {assetStrings.addAsset.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-5 px-10">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hidden companyId input */}
              <input
                type="hidden"
                {...register("companyId", {
                  required: assetStrings.addAsset.validation.companyRequired,
                })}
              />

              {/* Asset Name */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.addAsset.formLabels.assetName}
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.addAsset.placeholders.assetName}
                  {...register("assetName", {
                    required:
                      assetStrings.addAsset.validation.assetNameRequired,
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
                  {assetStrings.addAsset.formLabels.uniqueId}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.addAsset.placeholders.uniqueId}
                  {...register("uniqueId", {
                    required: assetStrings.addAsset.validation.uniqueIdRequired,
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
                  {assetStrings.addAsset.formLabels.brand}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.addAsset.placeholders.brand}
                  {...register("brand", {
                    required: assetStrings.addAsset.validation.brandRequired,
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
                  {assetStrings.addAsset.formLabels.model}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.addAsset.placeholders.model}
                  {...register("model", {
                    required: assetStrings.addAsset.validation.modelRequired,
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
                  {assetStrings.addAsset.formLabels.serialNumber}
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  placeholder={assetStrings.addAsset.placeholders.serialNumber}
                  {...register("serialNumber", {
                    required:
                      assetStrings.addAsset.validation.serialNumberRequired,
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
                  {assetStrings.addAsset.formLabels.status}
                </label>
                <select
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  {...register("status", {
                    required: assetStrings.addAsset.validation.statusRequired,
                  })}
                >
                  <option value="ACTIVE">
                    {assetStrings.addAsset.statusOptions.ACTIVE}
                  </option>
                  <option value="IN_USE">
                    {assetStrings.addAsset.statusOptions.IN_USE}
                  </option>
                  <option value="UNDER_MAINTENANCE">
                    {assetStrings.addAsset.statusOptions.UNDER_MAINTENANCE}
                  </option>
                  <option value="RETIRED">
                    {assetStrings.addAsset.statusOptions.RETIRED}
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
                  {assetStrings.addAsset.formLabels.description}
                </label>
                <textarea
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  rows={2}
                  placeholder={assetStrings.addAsset.placeholders.description}
                  {...register("description", {
                    required:
                      assetStrings.addAsset.validation.descriptionRequired,
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
                  Organization
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
            </div>

            <hr className="mt-4" />
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={loading}
              >
                {assetStrings.addAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg"
                disabled={loading}
              >
                {loading
                  ? assetStrings.addAsset.buttons.saving
                  : assetStrings.addAsset.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAsset;

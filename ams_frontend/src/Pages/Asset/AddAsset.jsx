import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { createAsset } from "../../Features/slices/assetSlice";
import API from "../../App/api/axiosInstance";
import assetStrings from "../../locales/assetStrings";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getAllAssets } from "../../Features/slices/assetSlice";
import userStrings from "../../locales/userStrings.js";
const AddAsset = ({ onClose, onSuccess }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const { loading, currentPage, rowsPerPage } = useSelector(
    (state) => state.assetUserData
  );
  const { user } = useSelector((state) => state.auth);

  const [noBranchesFound, setNoBranchesFound] = useState(false);
  const [noDeptsFound, setNoDeptsFound] = useState(false);

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
      status: "UNASSIGNED",
      branchId: "",
      departmentId: "",
      companyId: user?.companyId ,
    },
    mode: "onChange",
  });
  const assetName = watch("assetName");
  const uniqueId = watch("uniqueId");
  const brand = watch("brand");
  const model = watch("model");
  const branchId = watch("branchId");
  const serialNumber = watch("serialNumber");
  const description = watch("description");
  const departmentId = watch("departmentId");

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

  useEffect(() => {
    if (branchId) {
      fetchDepartments(1, deptSearchTerm);
    }
  }, [branchId, deptSearchTerm]);

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
      required: assetStrings.addAsset.validation.branchRequired,
    });
    register("departmentId", {
      required: assetStrings.addAsset.validation.departmentRequired,
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
      await dispatch(createAsset(data)).unwrap();
      await dispatch(
        getAllAssets({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();
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
                {/* Asset Name */}
                <div className="w-full">
                  <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.assetName}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      ref={firstInputRef}
                      id="assetName"
                      type="text"
                      maxLength={25}
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.assetName ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                      placeholder={assetStrings.addAsset.placeholders.assetName}
                      {...register("assetName", {
                        required: assetStrings.addAsset.validation.assetNameRequired,
                        minLength: {
                          value: 3,
                          message: assetStrings.addAsset.validation.assetNameMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: assetStrings.addAsset.validation.assetNameMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.assetNamePattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.AssetTrimSpaces;
                          }
                          return true;
                        },
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
                  <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.uniqueId}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      id="uniqueId"
                      maxLength={25}
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.uniqueId ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      placeholder={assetStrings.addAsset.placeholders.uniqueId}
                      {...register("uniqueId", {
                        required: assetStrings.addAsset.validation.uniqueIdRequired,
                        minLength: {
                          value: 3,
                          message: assetStrings.addAsset.validation.uniqueIdMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: assetStrings.addAsset.validation.uniqueIdMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.uniqueIdPattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.UniqueTrimSpaces;
                          }
                          return true;
                        },
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
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.brand}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      maxLength={25}
                      id="brand"
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.brand ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      placeholder={assetStrings.addAsset.placeholders.brand}
                      {...register("brand", {
                        required: assetStrings.addAsset.validation.brandRequired,
                        minLength: {
                          value: 3,
                          message: assetStrings.addAsset.validation.brandMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: assetStrings.addAsset.validation.brandMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.brandPattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.BrandTrimSpaces;
                          }
                          return true;
                        },
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
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.model}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      maxLength={25}
                      id="model"
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.model ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      placeholder={assetStrings.addAsset.placeholders.model}
                      {...register("model", {
                        required: assetStrings.addAsset.validation.modelRequired,
                        minLength: {
                          value: 3,
                          message: assetStrings.addAsset.validation.modelMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: assetStrings.addAsset.validation.modelMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.modelPattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.ModelTrimSpaces;
                          }
                          return true;
                        },
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
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.serialNumber}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      maxLength={25}
                      id="serialNumber"
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.serialNumber ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      placeholder={assetStrings.addAsset.placeholders.serialNumber}
                      {...register("serialNumber", {
                        required: assetStrings.addAsset.validation.serialNumberRequired,
                        minLength: {
                          value: 3,
                          message: assetStrings.addAsset.validation.serialNumberMinLength,
                        },
                        maxLength: {
                          value: 25,
                          message: assetStrings.addAsset.validation.serialNumberMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.serialNumberPattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.SerialTrimSpaces;
                          }
                          return true;
                        },
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
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                      disabled={loading}
                      className={`mt-1 p-2 w-full border ${
                          errors.status ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      {...register("status", {
                        required: assetStrings.addAsset.validation.statusRequired,
                      })}
                  >
                    <option value="UNASSIGNED">
                      {assetStrings.addAsset.statusOptions.unassigned}
                    </option>
                    <option value="ASSIGNED">
                      {assetStrings.addAsset.statusOptions.assigned}
                    </option>
                    <option value="LOST">
                      {assetStrings.addAsset.statusOptions.lost}
                    </option>
                    <option value="DAMAGED">
                      {assetStrings.addAsset.statusOptions.damaged}
                    </option>
                    <option value="IN_REPAIR">
                      {assetStrings.addAsset.statusOptions.in_REPAIR}
                    </option>
                    <option value="DISPOSED">
                      {assetStrings.addAsset.statusOptions.disposed}
                    </option>
                    <option value="IN_USE">
                      {assetStrings.addAsset.statusOptions.in_use}
                    </option>
                    <option value="UNDER_MAINTENANCE">
                      {assetStrings.addAsset.statusOptions.maintenance}
                    </option>
                    <option value="RETIRED">
                      {assetStrings.addAsset.statusOptions.retired}
                    </option>
                  </select>
                  {errors.status && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.status.message}
                      </p>
                  )}
                </div>

                {/* Branch Dropdown */}
                <div className="w-full relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.branch}
                    <span className="text-red-500">*</span>
                  </label>
                  <div
                      onClick={!loading ? () => {
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
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                  >
                    {selectedBranch ? selectedBranch.branchName : "Select Branch"}
                  </div>
                  {errors.branchId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.branchId.message}
                      </p>
                  )}
                  {showBranchDropdown && !loading && (
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
                            disabled={loading}
                        />
                        <ul
                            onScroll={handleBranchScroll}
                            className="max-h-40 overflow-auto"
                        >
                          {branches.map((branch) => (
                              <li
                                  key={branch.id}
                                  onClick={!loading ? () => handleBranchSelect(branch) : undefined}
                                  className={`px-4 py-2 hover:bg-gray-100 ${
                                      loading ? 'cursor-not-allowed' : 'cursor-pointer'
                                  }`}
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
                    {assetStrings.addAsset.formLabels.department}
                    <span className="text-red-500">*</span>
                  </label>
                  <div
                      onClick={!loading ? () => {
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
                          loading ? 'opacity-70 cursor-not-allowed' : ''
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
                  {showDeptDropdown && !loading && (
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
                            disabled={loading}
                        />
                        <ul
                            onScroll={handleDeptScroll}
                            className="max-h-40 overflow-auto"
                        >
                          {departments.map((dept) => (
                              <li
                                  key={dept.id}
                                  onClick={!loading ? () => handleDeptSelect(dept) : undefined}
                                  className={`px-4 py-2 hover:bg-gray-100 ${
                                      loading ? 'cursor-not-allowed' : 'cursor-pointer'
                                  }`}
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

                {/* Description */}
                <div className="w-full">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    {assetStrings.addAsset.formLabels.description}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                      disabled={loading}
                      className={`mt-1 p-2 w-[206%] border ${
                          errors.description ? "border-red-500" : "border-gray-300"
                      } outline-none rounded-md truncate disabled:opacity-70 disabled:cursor-not-allowed`}
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      rows={2}
                      id="description"
                      maxLength={200}
                      placeholder={assetStrings.addAsset.placeholders.description}
                      {...register("description", {
                        required: assetStrings.addAsset.validation.descriptionRequired,
                        minLength: {
                          value: 10,
                          message: assetStrings.addAsset.validation.descriptionMinLength,
                        },
                        maxLength: {
                          value: 200,
                          message: assetStrings.addAsset.validation.descriptionMaxLength,
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9 ]+$/,
                          message: assetStrings.addAsset.validation.descriptionPattern,
                        },
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (value !== trimmed) {
                            return assetStrings.addAsset.validation.DescriptionTrimSpaces;
                          }
                          return true;
                        },
                      })}
                  />
                  {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                  )}
                </div>
              </div>

              <hr className="mt-4" />
              <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                  {assetStrings.addAsset.buttons.close}
                </button>
                <button
                    type="submit"
                    className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
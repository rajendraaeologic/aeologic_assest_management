import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAsset,
  setSelectedAsset,
} from "../../Features/slices/assetSlice";
import { toast } from "react-toastify";
import API from "../../App/api/axiosInstance";
import assetStrings from "../../locales/assetStrings";
import { useForm } from "react-hook-form";

const UpdateAsset = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { selectedAsset } = useSelector((state) => state.assetData);
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      name: "",
      uniqueId: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      status: "ACTIVE",
      // categoryId: "",
      // locationId: "",

      branchId: "",
      departmentId: "",
    },
  });

  const watchBranchId = watch("branchId");
  const watchDepartmentId = watch("departmentId");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await API.get("/branch");
        setBranches(response.data);
      } catch (error) {
        console.error(assetStrings.addAsset.errorMessages.fetchBranches, error);
      }
    };

    fetchBranches();
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      reset({
        name: selectedAsset.name || "",
        uniqueId: selectedAsset.uniqueId || "",
        description: selectedAsset.description || "",
        brand: selectedAsset.brand || "",
        model: selectedAsset.model || "",
        serialNumber: selectedAsset.serialNumber || "",
        status: selectedAsset.status || "ACTIVE",
        // categoryId: selectedAsset.categoryId || "",
        // locationId: selectedAsset.locationId || "",

        branchId: selectedAsset.branchId || "",
        departmentId: selectedAsset.departmentId || "",
      });

      if (selectedAsset.branchId) {
        fetchDepartments(selectedAsset.branchId);
      }

      if (selectedAsset.departmentId) {
        fetchUsers(selectedAsset.departmentId);
      }
    }
  }, [selectedAsset, reset]);

  const fetchDepartments = async (branchId) => {
    try {
      const response = await API.get(`/department?branchId=${branchId}`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchUsers = async (departmentId) => {
    try {
      const response = await API.get(
        `/user?departmentId=${departmentId}&userRole=USER`
      );
      setUsers(response.data);
    } catch (error) {
      console.error(assetStrings.addAsset.errorMessages.fetchUsers, error);
    }
  };

  useEffect(() => {
    if (watchBranchId) {
      fetchDepartments(watchBranchId);
    } else {
      setDepartments([]);
      setUsers([]);
      setValue("departmentId", "");
      setValue("assignedToUserId", "");
    }
  }, [watchBranchId, setValue]);

  useEffect(() => {
    if (watchDepartmentId) {
      fetchUsers(watchDepartmentId);
    } else {
      setUsers([]);
      setValue("assignedToUserId", "");
    }
  }, [watchDepartmentId, setValue]);

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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = {
        params: { id: selectedAsset.id },
        body: { ...data },
      };

      await dispatch(updateAsset(updateData)).unwrap();
      toast.success(assetStrings.updateAsset.toast.success);
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || assetStrings.updateAsset.toast.error);
    } finally {
      setLoading(false);
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
        className={`mt-[20px] w-[820px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.name}
                </label>
                <input
                  ref={(e) => {
                    firstInputRef.current = e;
                    register("name", { required: "Name is required" }).ref(e);
                  }}
                  type="text"
                  name="name"
                  className={`mt-1 p-2 w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.uniqueId}
                </label>
                <input
                  type="text"
                  {...register("uniqueId", {
                    required: "Unique ID is required",
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.uniqueId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.uniqueId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.uniqueId.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.brand}
                </label>
                <input
                  type="text"
                  {...register("brand")}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.model}
                </label>
                <input
                  type="text"
                  {...register("model")}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.serialNumber}
                </label>
                <input
                  type="text"
                  {...register("serialNumber")}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.status}
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="ACTIVE">
                    {assetStrings.updateAsset.statusOptions.ACTIVE}
                  </option>
                  <option value="INACTIVE">
                    {assetStrings.updateAsset.statusOptions.INACTIVE}
                  </option>
                  <option value="UNDER_REPAIR">
                    {assetStrings.updateAsset.statusOptions.UNDER_REPAIR}
                  </option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.description}
                </label>
                <textarea
                  {...register("description")}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  rows={2}
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.branch}
                </label>
                <select
                  {...register("branchId", { required: "Branch is required" })}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">
                    {assetStrings.updateAsset.placeholders.selectBranch}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.branchId.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.updateAsset.formLabels.department}
                </label>
                <select
                  {...register("departmentId", {
                    required: "Department is required",
                    validate: (value) =>
                      !watchBranchId ||
                      value !== "" ||
                      "Please select a department",
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={!watchBranchId}
                >
                  <option value="">
                    {assetStrings.updateAsset.placeholders.selectDepartment}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
            </div>

            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={loading}
              >
                {assetStrings.updateAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg"
                disabled={loading}
              >
                {loading
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

import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { createAsset } from "../../Features/slices/assetSlice";
import { getAllBranches } from "../../Features/slices/branchSlice";
import API from "../../App/api/axiosInstance";
import assetStrings from "../../locales/assetStrings";
import { useForm } from "react-hook-form";

const AddAsset = ({ onClose, onSuccess }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  // Redux state selectors
  const { loading, error } = useSelector((state) => state.assetUserData);
  const { branches } = useSelector((state) => state.branchData);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    },
  });

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch branches on component mount using Redux
  useEffect(() => {
    dispatch(getAllBranches());
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [dispatch]);

  // Fetch departments when branch changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!branchId) {
        setDepartments([]);
        setValue("departmentId", "");
        setValue("assignedToUserId", "");
        setUsers([]);
        return;
      }

      try {
        setLoadingDepartments(true);
        const response = await API.get(`/department/${branchId}/departments`);
        setDepartments(response.data.data);
      } catch (error) {
        console.error(
          assetStrings.addAsset.errorMessages.fetchDepartments,
          error
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [branchId, setValue]);

  // Fetch users when department changes
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     if (departmentId) {
  //       try {
  //         const response = await API.get(
  //           `/user?departmentId=${departmentId}&userRole=USER`
  //         );
  //         setUsers(response.data);
  //         setValue("assignedToUserId", "");
  //       } catch (error) {
  //         console.error(assetStrings.addAsset.errorMessages.fetchUsers, error);
  //       }
  //     } else {
  //       setUsers([]);
  //     }
  //   };
  //
  //   fetchUsers();
  // }, [departmentId, setValue]);

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

  const onSubmit = async (data) => {
    try {
      await dispatch(createAsset(data)).unwrap();
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(assetStrings.addAsset.toast.error, error);
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
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {...register("brand")}
                />
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
                  {...register("model")}
                />
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
                  {...register("serialNumber")}
                />
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
                  {...register("description")}
                />
              </div>

              {/* Branch */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.addAsset.formLabels.branchId}
                </label>
                <select
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  {...register("branchId", {
                    required: assetStrings.addAsset.validation.branchRequired,
                  })}
                >
                  <option value="">
                    {assetStrings.addAsset.select.defaultBranch}
                  </option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.branchId.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assetStrings.addAsset.formLabels.departmentId}
                </label>
                <select
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  disabled={!branchId || loadingDepartments}
                  {...register("departmentId", {
                    required:
                      assetStrings.addAsset.validation.departmentRequired,
                  })}
                >
                  <option value="">
                    {loadingDepartments
                      ? assetStrings.addAsset.select.loadingDepartments
                      : assetStrings.addAsset.select.defaultDepartment}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
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

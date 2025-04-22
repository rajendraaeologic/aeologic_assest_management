import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import assignAssetStrings from "../../locales/assignAssetStrings";
import { createAsset, getAllAssets } from "../../Features/slices/assetSlice";

const AddAssignAsset = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const { organizations } = useSelector((state) => state.organizationData);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      branchId: "",
      departmentId: "",
      assetId: "",
    },
  });

  const branchId = watch("branchId");
  const assetId = watch("assetId");

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await API.get(`/branches`);
        setBranches(response.data.data);
      } catch (error) {
        toast.error(assignAssetStrings.addAssignAsset.toast.branchError);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!branchId) {
        setDepartments([]);
        return;
      }
      try {
        setLoadingDepartments(true);
        const response = await API.get(`/department/${branchId}/departments`);
        setDepartments(response.data.data);
      } catch (error) {
        toast.error(assignAssetStrings.addAssignAsset.toast.departmentError);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [branchId]);

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
    try {
      await dispatch(createAsset(data)).unwrap();
      dispatch(getAllAssets());
      toast.success(assignAssetStrings.addAssignAsset.toast.success, {
        position: "top-right",
        autoClose: 2000,
      });
      handleClose();
    } catch (error) {
      const errorMessage = error?.message || "";

      if (errorMessage.includes("Asset already assigned")) {
        toast.error(assignAssetStrings.addAssignAsset.toast.assetAssigned, {
          autoClose: 2000,
        });
        return setError("assetId", {
          type: "manual",
          message: assignAssetStrings.addAssignAsset.toast.assetAssigned,
        });
      }

      toast.error(assignAssetStrings.addAssignAsset.toast.error, {
        position: "top-right",
        autoClose: 2000,
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
        className={`mt-[20px] w-[500px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {assignAssetStrings.addAssignAsset.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Branch Select */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.branch}
                </label>
                <select
                  {...register("branchId", {
                    required:
                      assignAssetStrings.addAssignAsset.validation
                        .branchRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? assignAssetStrings.addAssignAsset.select.loadingBranches
                      : assignAssetStrings.addAssignAsset.select.branchDefault}
                  </option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchId.message}
                  </p>
                )}
              </div>

              {/* Department Select */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.department}
                </label>
                <select
                  {...register("departmentId", {
                    required:
                      assignAssetStrings.addAssignAsset.validation
                        .departmentRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={loadingDepartments || !branchId}
                >
                  <option value="">
                    {loadingDepartments
                      ? assignAssetStrings.addAssignAsset.select
                          .loadingDepartments
                      : assignAssetStrings.addAssignAsset.select
                          .departmentDefault}
                  </option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              {/* Asset Select */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {assignAssetStrings.addAssignAsset.formLabels.asset}
                </label>
                <select
                  {...register("assetId", {
                    required:
                      assignAssetStrings.addAssignAsset.validation
                        .assetRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.assetId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">
                    {assignAssetStrings.addAssignAsset.select.assetDefault}
                  </option>
                  {/* Add asset options here */}
                </select>
                {errors.assetId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assetId.message}
                  </p>
                )}
              </div>
            </div>
            <hr className="mt-4" />
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {assignAssetStrings.addAssignAsset.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? assignAssetStrings.addAssignAsset.buttons.saving
                  : assignAssetStrings.addAssignAsset.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAssignAsset;

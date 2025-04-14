import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { createDepartment } from "../../Features/slices/departmentSlice";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import departmentStrings from "../../locales/departmentStrings";
import API from "../../App/api/axiosInstance";

const AddDepartment = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [organizationId, setorganizationId] = useState("");
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const { organizations } = useSelector((state) => state.organizationData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      departmentName: "",
      branchId: "",
    },
  });

  useEffect(() => {
    dispatch(getAllOrganizations());
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [dispatch]);

  useEffect(() => {
    if (organizationId) {
      const fetchBranches = async () => {
        try {
          setLoadingBranches(true);
          const response = await API.get(`/branch/${organizationId}/branches`);

          setBranches(response.data.data);
        } catch (error) {
          console.error("Error fetching branches:", error);
        } finally {
          setLoadingBranches(false);
        }
      };

      fetchBranches();
    }
  }, [organizationId]);

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
      await dispatch(
        createDepartment({
          departmentName: data.departmentName,
          branchId: data.branchId,
        })
      );
      toast.success(departmentStrings.addDepartment.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });
      handleClose();
    } catch (error) {
      toast.error(departmentStrings.addDepartment.toast.error, {
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
              <div className="w-full">
                <label
                  htmlFor="departmentName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {departmentStrings.addDepartment.formLabels.departmentName}
                </label>
                <input
                  ref={firstInputRef}
                  {...register("departmentName", {
                    required:
                      departmentStrings.addDepartment.validation
                        .departmentNameRequired,
                  })}
                  type="text"
                  id="departmentName"
                  placeholder={
                    departmentStrings.addDepartment.placeholders.departmentName
                  }
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.departmentName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departmentName.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {
                    departmentStrings.addDepartment.formLabels
                      .selectOrganization
                  }
                </label>
                <select
                  value={organizationId}
                  onChange={(e) => {
                    setorganizationId(e.target.value);
                    setValue("branchId", "");
                  }}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md outline-none"
                >
                  <option value="">Select Organization</option>
                  {organizations?.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.organizationName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700"
                >
                  {departmentStrings.addDepartment.formLabels.selectBranch}
                </label>
                <select
                  {...register("branchId", {
                    required:
                      departmentStrings.addDepartment.validation.branchRequired,
                  })}
                  id="branchId"
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">Select Branch</option>
                  {loadingBranches ? (
                    <option value="">Loading branches...</option>
                  ) : (
                    branches?.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </option>
                    ))
                  )}
                </select>
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
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={isSubmitting}
              >
                {departmentStrings.addDepartment.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
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

import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import {
  createBranch,
  getAllBranches,
} from "../../Features/slices/branchSlice";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import branchStrings from "../../locales/branchStrings";

const AddBranch = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  const { organizations, loading: orgLoading } = useSelector(
    (state) => state.organizationData
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      branchName: "",
      branchLocation: "",
      companyId: "",
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
      await dispatch(createBranch(data));
      dispatch(getAllBranches());

      toast.success(branchStrings.addBranch.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      toast.error(branchStrings.addBranch.toast.error, {
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
        className={`mt-[20px] w-[500px] min-h-80 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {branchStrings.addBranch.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full">
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {branchStrings.addBranch.formLabels.branchName}
                </label>
                <input
                  ref={firstInputRef}
                  {...register("branchName", {
                    required:
                      branchStrings.addBranch.validation.branchNameRequired,
                  })}
                  type="text"
                  id="branchName"
                  name="branchName"
                  placeholder={branchStrings.addBranch.placeholders.branchName}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.branchName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchName.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="branchLocation"
                  className="block text-sm font-medium text-gray-700"
                >
                  {branchStrings.addBranch.formLabels.branchLocation}
                </label>
                <input
                  {...register("branchLocation", {
                    required:
                      branchStrings.addBranch.validation.branchLocationRequired,
                  })}
                  type="text"
                  id="branchLocation"
                  name="branchLocation"
                  placeholder={
                    branchStrings.addBranch.placeholders.branchLocation
                  }
                  className={`mt-1 p-2 w-full border ${
                    errors.branchLocation ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.branchLocation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchLocation.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="companyId"
                  className="block text-sm font-medium text-gray-700"
                >
                  {branchStrings.addBranch.formLabels.companyId}
                </label>
                <select
                  {...register("companyId", {
                    required:
                      branchStrings.addBranch.validation.organizationRequired,
                  })}
                  id="companyId"
                  name="companyId"
                  className={`mt-1 p-2 w-full border ${
                    errors.companyId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={orgLoading}
                >
                  <option value="">
                    {orgLoading
                      ? branchStrings.addBranch.select.loading
                      : branchStrings.addBranch.select.defaultOption}
                  </option>
                  {organizations?.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.organizationName}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyId.message}
                  </p>
                )}
              </div>
            </div>

            <hr className="mt-4" />
            <div className="flex justify-end gap-4 md:mt-6 mt-4 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={isSubmitting}
              >
                {branchStrings.addBranch.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? branchStrings.addBranch.buttons.saving
                  : branchStrings.addBranch.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBranch;

import React, { useEffect, useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import branchStrings from "../../locales/branchStrings";
import {
  createBranch,
  getAllBranches,
} from "../../Features/slices/branchSlice";
import { useDispatch, useSelector } from "react-redux";

const AddBranch = ({ onClose }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { currentPage, rowsPerPage } = useSelector((state) => state.branchData);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      branchName: "",
      branchLocation: "",
    },
    mode: "onChange",
  });

  const branchName = watch("branchName");
  const branchLocation = watch("branchLocation");

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  };


  const onSubmit = async (data) => {
    try {
      await dispatch(createBranch(data)).unwrap();
      await dispatch(
        getAllBranches({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();
      toast.success(branchStrings.addBranch.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });
      handleClose();
    } catch (error) {
      if (error?.status === 409) {
        setError("branchName", {
          type: "manual",
          message: error.message,
        });
        return;
      }
      toast.error(error.message || branchStrings.addBranch.toast.error, {
        position: "top-right",
        autoClose: 1500,
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
            {branchStrings.addBranch.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {branchStrings.addBranch.formLabels.branchName}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  {...register("branchName", {
                    required:
                      branchStrings.addBranch.validation.branchNameRequired,
                    minLength: {
                      value: 3,
                      message:
                        branchStrings.addBranch.validation.branchNameMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message:
                        branchStrings.addBranch.validation.branchNameMaxLength,
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9 ]+$/,
                      message:
                        branchStrings.addBranch.validation.branchNamePattern,
                    },
                  })}
                  type="text"
                  id="branchName"
                  maxLength={25}
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
                {branchName?.length === 25 && (
                  <p className="text-red-500 text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="branchLocation"
                  className="block text-sm font-medium text-gray-700"
                >
                  {branchStrings.addBranch.formLabels.branchLocation}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("branchLocation", {
                    required:
                      branchStrings.addBranch.validation.branchLocationRequired,
                    minLength: {
                      value: 3,
                      message:
                        branchStrings.addBranch.validation
                          .branchLocationMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message:
                        branchStrings.addBranch.validation
                          .branchLocationMaxLength,
                    },
                  })}
                  type="text"
                  maxLength={25}
                  id="branchLocation"
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
                {branchLocation?.length === 25 && (
                  <p className="text-red-500 text-sm mt-1">
                    Maximum 25 characters allowed
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

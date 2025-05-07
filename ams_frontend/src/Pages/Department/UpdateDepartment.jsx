import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import {
  updateDepartment,
  getAllDepartments,
} from "../../Features/slices/departmentSlice";
import { getAllBranches } from "../../Features/slices/branchSlice";
import departmentStrings from "../../locales/departmentStrings";

const UpdateDepartment = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  const selectedDepartment = useSelector(
    (state) => state.departmentData.selectedDepartment
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      departmentName: "",
    },
    mode: "onChange",
  });

  const departmentName = watch("departmentName");

  useEffect(() => {
    dispatch(getAllBranches());
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedDepartment) {
      reset({
        departmentName: selectedDepartment.departmentName,
      });
    }
  }, [selectedDepartment, reset]);

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
      const departmentData = {
        params: { departmentId: selectedDepartment.id },
        body: {
          departmentName: data.departmentName,
        },
      };

      await dispatch(updateDepartment(departmentData)).unwrap();
      dispatch(getAllDepartments());

      toast.success(departmentStrings.updateDepartment.toast.success, {
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
          departmentStrings.updateDepartment.toast.error || {
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
        className={`mt-[20px] w-[400px] min-h-40 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {departmentStrings.updateDepartment.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-4">
              <div className="w-full">
                <label
                  htmlFor="departmentName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {departmentStrings.updateDepartment.formLabels.departmentName}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  ref={firstInputRef}
                  {...register("departmentName", {
                    required:
                      departmentStrings.updateDepartment.validation
                        .departmentNameRequired,
                    minLength: {
                      value: 3,
                      message:
                        departmentStrings.updateDepartment.validation
                          .departmentNameMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message:
                        departmentStrings.updateDepartment.validation
                          .departmentNameMaxLength,
                    },
                  })}
                  type="text"
                  maxLength={25}
                  id="departmentName"
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.departmentName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departmentName.message}
                  </p>
                )}
                {departmentName.length === 25 && (
                  <p className="text-red-500  text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>
            </div>

            <hr className="mt-4" />
            <div className="flex justify-end gap-4 mt-4 mb-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={isSubmitting}
              >
                {departmentStrings.updateDepartment.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? departmentStrings.updateDepartment.buttons.updating
                  : departmentStrings.updateDepartment.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateDepartment;

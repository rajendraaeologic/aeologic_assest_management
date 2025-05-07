import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import {
  updateOrganization,
  getAllOrganizations,
} from "../../Features/slices/organizationSlice";
import organizationStrings from "../../locales/organizationStrings";

const UpdateOrganization = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  const selectedOrganization = useSelector(
    (state) => state.organizationData.selectedOrganization
  );

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      organizationName: "",
    },
    mode: "onChange",
  });
  const organizationName = watch("organizationName");
  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      reset({
        organizationName: selectedOrganization.organizationName,
      });
    }
  }, [selectedOrganization, reset]);

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
      const organizationData = {
        params: { organizationId: selectedOrganization.id },
        body: {
          organizationName: data.organizationName,
        },
      };

      await dispatch(updateOrganization(organizationData)).unwrap();
      dispatch(getAllOrganizations());

      toast.success(organizationStrings.updateOrganization.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      if (error?.status === 409) {
        setError("organizationName", {
          type: "manual",
          message: error.message,
        });
        return;
      }
      toast.error(
        error.message || organizationStrings.updateOrganization.toast.error,
        {
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
        className={`mt-[20px] w-[400px] min-h-60 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {organizationStrings.updateOrganization.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-gray-700"
              >
                {
                  organizationStrings.updateOrganization.formLabels
                    .organizationName
                }
                <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                {...register("organizationName", {
                  required:
                    organizationStrings.updateOrganization.validation
                      .organizationNameRequired,
                  minLength: {
                    value: 3,
                    message:
                      organizationStrings.addOrganization.validation
                        .organizationNameMinLength,
                  },
                  maxLength: {
                    value: 25,
                    message:
                      organizationStrings.addOrganization.validation
                        .organizationNameMaxLength,
                  },
                })}
                type="text"
                id="organizationName"
                maxLength={25}
                placeholder={
                  organizationStrings.updateOrganization.placeholders
                    .organizationName
                }
                className={`mt-1 p-2 w-full border ${
                  errors.organizationName ? "border-red-500" : "border-gray-300"
                } outline-none rounded-md`}
              />
              {errors.organizationName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.organizationName.message}
                </p>
              )}
              {organizationName.length === 25 && (
                <p className="text-red-500  text-sm mt-1">
                  Maximum 25 characters allowed
                </p>
              )}
            </div>

            <hr className="mt-4" />
            <div className="flex justify-end gap-4 mt-4 mb-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={isSubmitting}
              >
                {organizationStrings.updateOrganization.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? organizationStrings.updateOrganization.buttons.updating
                  : organizationStrings.updateOrganization.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrganization;

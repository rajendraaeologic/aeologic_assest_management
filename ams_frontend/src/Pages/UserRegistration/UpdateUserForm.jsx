import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { getAllUsers, updateUser } from "../../Features/slices/userSlice";
import userStrings from "../../locales/userStrings";

const UpdateUserForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  const selectedUser = useSelector((state) => state.usersData.selectedUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      reset({
        userName: selectedUser.userName || "",
        phone: selectedUser.phone || "",
        email: selectedUser.email || "",
        userRole: selectedUser.userRole || "",
      });
    }
  }, [selectedUser, reset]);

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
      const userData = {
        params: { userId: selectedUser.id },
        body: {
          userName: data.userName,
          phone: data.phone,
          email: data.email,
          userRole: data.userRole,
        },
      };

      await dispatch(updateUser(userData)).unwrap();
      dispatch(getAllUsers());

      toast.success(userStrings.updateUser.toast.success, {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      toast.error(userStrings.updateUser.toast.error, {
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
        className={`mt-[20px] w-[400px] min-h-60 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            {userStrings.updateUser.title}
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.userName}
                </label>
                <input
                  ref={firstInputRef}
                  {...register("userName", {
                    required:
                      userStrings.updateUser.validation.userNameRequired,
                  })}
                  type="text"
                  className={`mt-1 p-2 w-full border ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.phone}
                </label>
                <input
                  {...register("phone", {
                    required: userStrings.updateUser.validation.phoneRequired,
                    minLength: {
                      value: 7,
                      message: userStrings.updateUser.validation.phoneMinLength,
                    },
                  })}
                  type="tel"
                  className={`mt-1 p-2 w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.email}
                </label>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: userStrings.updateUser.validation.emailInvalid,
                    },
                  })}
                  type="email"
                  className={`mt-1 p-2 w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* User Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.userRole}
                </label>
                <select
                  {...register("userRole", {
                    required:
                      userStrings.updateUser.validation.userRoleRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.userRole ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">{userStrings.updateUser.selectRole}</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="USER">USER</option>
                </select>
                {errors.userRole && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userRole.message}
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
                {userStrings.updateUser.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? userStrings.updateUser.buttons.updating
                  : userStrings.updateUser.buttons.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserForm;

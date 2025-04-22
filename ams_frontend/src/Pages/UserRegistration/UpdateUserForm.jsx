import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import { getAllUsers, updateUser } from "../../Features/slices/userSlice";
import userStrings from "../../locales/userStrings";

const UpdateUserForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const { organizations } = useSelector((state) => state.organizationData);
  const selectedUser = useSelector((state) => state.usersData.selectedUser);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const branchId = watch("branchId");

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
    if (selectedUser) {
      reset({
        userName: selectedUser.userName || "",

        phone: selectedUser.phone || "",
        email: selectedUser.email || "",
        userRole: selectedUser.userRole || "",
        branchId: selectedUser.branch?.id || "",
        departmentId: selectedUser.department?.id || "",
        status: selectedUser.status || "ACTIVE",
      });
      setSelectedOrgId(selectedUser.organization?.id || "");
    }
  }, [selectedUser, reset]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedOrgId) {
        setBranches([]);
        return;
      }
      try {
        setLoadingBranches(true);
        const response = await API.get(`/branch/${selectedOrgId}/branches`);
        setBranches(response.data.data);
      } catch (error) {
        toast.error(userStrings.updateUser.toast.branchError);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [selectedOrgId]);

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
        toast.error(userStrings.updateUser.toast.departmentError);
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
      const userData = {
        params: { userId: selectedUser.id },
        body: {
          userName: data.userName,
          phone: data.phone,
          email: data.email,
          userRole: data.userRole,
          branchId: data.branchId,
          departmentId: data.departmentId,
          status: data.status,
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
      const errorMessage = error?.message || "";

      if (errorMessage.includes("Email already taken")) {
        toast.error(userStrings.updateUser.toast.emailTaken, {
          autoClose: 2000,
        });
        return;
      }

      if (errorMessage.includes("Phone already taken")) {
        toast.error(userStrings.updateUser.toast.phoneTaken, {
          autoClose: 2000,
        });
        return;
      }

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
        className={`mt-[20px] w-[500px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Name */}
              <div className="w-full">
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
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.phone}
                </label>
                <input
                  {...register("phone", {
                    required: userStrings.updateUser.validation.phoneRequired,
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: userStrings.updateUser.validation.phoneInvalid,
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
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.email}
                </label>
                <input
                  {...register("email", {
                    required: userStrings.updateUser.validation.emailRequired,
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

              {/* Organization Select */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.organization}
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md outline-none"
                >
                  <option value="">
                    {userStrings.updateUser.select.organizationDefault}
                  </option>
                  {organizations?.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.organizationName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Select */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.branch}
                </label>
                <select
                  {...register("branchId", {
                    required: userStrings.updateUser.validation.branchRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={!selectedOrgId || loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? userStrings.updateUser.select.loadingBranches
                      : userStrings.updateUser.select.branchDefault}
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
                  {userStrings.updateUser.formLabels.department}
                </label>
                <select
                  {...register("departmentId", {
                    required:
                      userStrings.updateUser.validation.departmentRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={!branchId || loadingDepartments}
                >
                  <option value="">
                    {loadingDepartments
                      ? userStrings.updateUser.select.loadingDepartments
                      : userStrings.updateUser.select.departmentDefault}
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

              {/* User Role */}
              <div className="w-full">
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
                  <option value="">
                    {userStrings.updateUser.select.roleDefault}
                  </option>
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

              {/* Status Dropdown */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.updateUser.formLabels.status}
                </label>
                <select
                  {...register("status", {
                    required: userStrings.updateUser.validation.statusRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="ACTIVE">
                    {userStrings.updateUser.select.statusActive}
                  </option>
                  <option value="INACTIVE">
                    {userStrings.updateUser.select.statusInactive}
                  </option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg disabled:opacity-50"
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

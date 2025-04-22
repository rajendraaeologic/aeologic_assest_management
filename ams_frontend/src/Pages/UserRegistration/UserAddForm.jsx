import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import userStrings from "../../locales/userStrings";
import { createUser, getAllUsers } from "../../Features/slices/userSlice";

const AddUserForm = ({ onClose }) => {
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

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      userName: "",
      phone: "",
      email: "",

      userRole: "",
      branchId: "",
      departmentId: "",
      status: "ACTIVE",
    },
  });

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
        toast.error(userStrings.addUser.toast.branchError);
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
        toast.error(userStrings.addUser.toast.departmentError);
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
      await dispatch(createUser(data)).unwrap();
      dispatch(getAllUsers());
      toast.success(userStrings.addUser.toast.success, {
        position: "top-right",
        autoClose: 2000,
      });
      handleClose();
    } catch (error) {
      const errorMessage = error?.message || "";

      if (errorMessage.includes("Email already taken")) {
        toast.error(userStrings.addUser.toast.emailTaken, { autoClose: 2000 });
        return setError("email", {
          type: "manual",
          message: userStrings.addUser.toast.emailTaken,
        });
      }

      if (errorMessage.includes("Phone already taken")) {
        toast.error(userStrings.addUser.toast.phoneTaken, { autoClose: 2000 });
        return setError("phone", {
          type: "manual",
          message: userStrings.addUser.toast.phoneTaken,
        });
      }

      toast.error(userStrings.addUser.toast.error, {
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
            {userStrings.addUser.title}
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
                  {userStrings.addUser.formLabels.userName}
                </label>
                <input
                  ref={firstInputRef}
                  {...register("userName", {
                    required: userStrings.addUser.validation.userNameRequired,
                  })}
                  type="text"
                  placeholder={userStrings.addUser.placeholders.userName}
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
                  {userStrings.addUser.formLabels.phone}
                </label>
                <input
                  {...register("phone", {
                    required: userStrings.addUser.validation.phoneRequired,
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: userStrings.addUser.validation.phoneInvalid,
                    },
                  })}
                  type="tel"
                  placeholder={userStrings.addUser.placeholders.phone}
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

              {/* Email */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  {userStrings.addUser.formLabels.email}
                </label>
                <input
                  {...register("email", {
                    required: userStrings.addUser.validation.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: userStrings.addUser.validation.emailInvalid,
                    },
                  })}
                  type="email"
                  placeholder={userStrings.addUser.placeholders.email}
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
                  {userStrings.addUser.formLabels.organization}
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md outline-none"
                >
                  <option value="">
                    {userStrings.addUser.select.organizationDefault}
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
                  {userStrings.addUser.formLabels.branch}
                </label>
                <select
                  {...register("branchId", {
                    required: userStrings.addUser.validation.branchRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={!selectedOrgId || loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? userStrings.addUser.select.loadingBranches
                      : userStrings.addUser.select.branchDefault}
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
                  {userStrings.addUser.formLabels.department}
                </label>
                <select
                  {...register("departmentId", {
                    required: userStrings.addUser.validation.departmentRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={!branchId || loadingDepartments}
                >
                  <option value="">
                    {loadingDepartments
                      ? userStrings.addUser.select.loadingDepartments
                      : userStrings.addUser.select.departmentDefault}
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
                  {userStrings.addUser.formLabels.role}
                </label>
                <select
                  {...register("userRole", {
                    required: userStrings.addUser.validation.roleRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.userRole ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="">
                    {userStrings.addUser.select.roleDefault}
                  </option>
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
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
                  {userStrings.addUser.formLabels.status}
                </label>
                <select
                  {...register("status", {
                    required: userStrings.addUser.validation.statusRequired,
                  })}
                  className={`mt-1 p-2 w-full border ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                >
                  <option value="ACTIVE">
                    {userStrings.addUser.select.statusActive}
                  </option>
                  <option value="INACTIVE">
                    {userStrings.addUser.select.statusInactive}
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
                {userStrings.addUser.buttons.close}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? userStrings.addUser.buttons.saving
                  : userStrings.addUser.buttons.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;

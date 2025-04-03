import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import {
  createDepartment,
  getAllDepartments,
} from "../../Features/slices/departmentSlice";
import { getAllBranches } from "../../Features/slices/branchSlice";

const AddDepartment = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  const { branches, loading: branchLoading } = useSelector(
    (state) => state.branchData
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
      branchId: "",
    },
  });

  useEffect(() => {
    dispatch(getAllBranches());
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
      await dispatch(createDepartment(data));
      dispatch(getAllDepartments());

      toast.success("Department added successfully!", {
        position: "top-right",
        autoClose: 1000,
      });

      handleClose();
    } catch (error) {
      toast.error("Failed to add department", {
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
        className={`mt-[20px] w-[700px] min-h-80 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">
            Add Department
          </h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-1  lg:grid-cols-2 gap-4">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Name*
                </label>
                <input
                  ref={firstInputRef}
                  {...register("name", {
                    required: "Department name is required",
                  })}
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Department name"
                  className={`mt-1 p-2 w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Location*
                </label>
                <input
                  {...register("location", {
                    required: "Department location is required",
                  })}
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Department location"
                  className={`mt-1 p-2 w-full border ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch*
                </label>
                <select
                  {...register("branchId", {
                    required: "Branch selection is required",
                  })}
                  id="branchId"
                  name="branchId"
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } outline-none rounded-md`}
                  disabled={branchLoading}
                >
                  <option value="">
                    {branchLoading ? "Loading branches..." : "Select Branch"}
                  </option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.branchId.message}
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
                Close
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDepartment;

import React, { useEffect, useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import API from "../../App/api/axiosInstance";
import branchStrings from "../../locales/branchStrings";
import {
  createBranch,
  getAllBranches,
} from "../../Features/slices/branchSlice";
import { useDispatch } from "react-redux";

const AddBranch = ({ onClose }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      branchName: "",
      branchLocation: "",
      companyId: "",
    },
  });

  const fetchOrganizations = async (page, search = "") => {
    try {
      setOrgLoading(true);
      const response = await API.get(
        `/organization/getAllOrganizations?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;

      if (page === 1) {
        setOrganizations(data);
      } else {
        setOrganizations((prev) => [...prev, ...data]);
      }
      setOrgPage(page);
      setHasMoreOrgs(page < totalPages);
    } catch (error) {
      toast.error(branchStrings.addBranch.toast.error, {
        position: "top-right",
        autoClose: 1000,
      });
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(1, "");
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  const handleOrgScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;

    if (bottomReached && !orgLoading && hasMoreOrgs) {
      fetchOrganizations(orgPage + 1, searchTerm);
    }
  };

  const onSubmit = async (data) => {
    if (!data.companyId) {
      toast.error("Please select a valid organization", {
        position: "top-right",
        autoClose: 1000,
      });
      return;
    }

    try {
      await dispatch(createBranch(data)).unwrap();
      dispatch(getAllBranches());
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

      const errorMessage = error.message || branchStrings.addBranch.toast.error;
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const handleOrgClick = async () => {
    const newState = !showOrgDropdown;
    setShowOrgDropdown(newState);

    if (!newState) {
      setSearchTerm("");
    } else {
      if (searchTerm.trim() === "") {
        await fetchOrganizations(1, "");
      }
    }
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setValue("companyId", org.id);
    setShowOrgDropdown(false);
    setSearchTerm("");
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    fetchOrganizations(1, search);
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
                <label className="block text-sm font-medium text-gray-700">
                  {branchStrings.addBranch.formLabels.branchName}
                </label>
                <input
                  ref={firstInputRef}
                  {...register("branchName", {
                    required:
                      branchStrings.addBranch.validation.branchNameRequired,
                  })}
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700">
                  {branchStrings.addBranch.formLabels.branchLocation}
                </label>
                <input
                  {...register("branchLocation", {
                    required:
                      branchStrings.addBranch.validation.branchLocationRequired,
                  })}
                  type="text"
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

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {branchStrings.addBranch.formLabels.companyId}
                </label>
                <div
                  onClick={handleOrgClick}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md cursor-pointer bg-white"
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : branchStrings.addBranch.select.defaultOption}
                </div>

                {showOrgDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search organization..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleOrgScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {organizations.map((org) => (
                        <li
                          key={org.id}
                          onClick={() => handleOrgSelect(org)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {org.organizationName}
                        </li>
                      ))}
                      {orgLoading && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
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

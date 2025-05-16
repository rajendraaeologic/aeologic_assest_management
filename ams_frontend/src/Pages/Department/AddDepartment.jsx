import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { createDepartment } from "../../Features/slices/departmentSlice";
import departmentStrings from "../../locales/departmentStrings";
import API from "../../App/api/axiosInstance";
import { getAllDepartments } from "../../Features/slices/departmentSlice";

const AddDepartment = ({ onClose }) => {
  const dispatch = useDispatch();
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [branchPage, setBranchPage] = useState(1);
  const [hasMoreBranches, setHasMoreBranches] = useState(true);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { currentPage, rowsPerPage } = useSelector(
    (state) => state.departmentData
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      departmentName: "",
      branchId: "",
      organizationId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    register("organizationId", {
      required: departmentStrings.addDepartment.validation.organizationRequired,
    });
    register("branchId", {
      required: departmentStrings.addDepartment.validation.branchRequired,
    });
  }, [register]);

  const departmentName = watch("departmentName");

  const fetchOrganizations = async (page, search = "") => {
    try {
      setOrgLoading(true);
      const response = await API.get(
        `/organization/getAllOrganizations?page=${page}&limit=5&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;

      setOrganizations((prev) => (page === 1 ? data : [...prev, ...data]));
      setOrgPage(page);
      setHasMoreOrgs(page < totalPages);
    } catch (error) {
      toast.error(departmentStrings.addDepartment.toast.error, {
        position: "top-right",
        autoClose: 1000,
      });
    } finally {
      setOrgLoading(false);
    }
  };

  const fetchBranches = async (page, search = "") => {
    if (!organizationId) return;

    try {
      setLoadingBranches(true);
      const response = await API.get(
        `/branch/${organizationId}/branches?limit=5&page=${page}&searchTerm=${search}`
      );
      const { data, totalPages } = response.data;

      setBranches((prev) => (page === 1 ? data : [...prev, ...data]));
      setBranchPage(page);
      setHasMoreBranches(page < totalPages);
    } catch (error) {
      toast.error("Error fetching branches");
    } finally {
      setLoadingBranches(false);
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

  useEffect(() => {
    if (organizationId) {
      setBranchSearchTerm("");
      setBranchPage(1);
      fetchBranches(1, "");
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

  const handleOrgScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !orgLoading && hasMoreOrgs) {
      fetchOrganizations(orgPage + 1, searchTerm);
    }
  };

  const handleOrgSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    fetchOrganizations(1, search);
  };

  const handleOrgClick = () => {
    setShowOrgDropdown(!showOrgDropdown);
    if (!showOrgDropdown && searchTerm === "") {
      fetchOrganizations(1, "");
    }
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setOrganizationId(org.id);
    setValue("organizationId", org.id, { shouldValidate: true });
    setValue("branchId", "");
    setSelectedBranch(null);
    setShowOrgDropdown(false);
    setSearchTerm("");
  };

  const handleBranchScroll = (e) => {
    const bottomReached =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottomReached && !loadingBranches && hasMoreBranches) {
      fetchBranches(branchPage + 1, branchSearchTerm);
    }
  };

  const handleBranchSearch = (e) => {
    const search = e.target.value;
    setBranchSearchTerm(search);
    fetchBranches(1, search);
  };

  const handleBranchClick = async () => {
    if (!organizationId) {
      toast.error("Please select an organization first");
      return;
    }
    setShowBranchDropdown((prev) => !prev);
    if (!showBranchDropdown) {
      setBranchSearchTerm("");
      setBranchPage(1);
      setBranches([]);
      await fetchBranches(1, "");
    }
  };

  const handleBranchSelect = (branch) => {
    setValue("branchId", branch.id, { shouldValidate: true });
    setSelectedBranch(branch);
    setShowBranchDropdown(false);
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(
        createDepartment({
          departmentName: data.departmentName,
          branchId: data.branchId,
        })
      ).unwrap();

      await dispatch(
        getAllDepartments({
          page: currentPage,
          limit: rowsPerPage,
        })
      ).unwrap();
      toast.success(departmentStrings.addDepartment.toast.success, {
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
          departmentStrings.addDepartment.toast.error || {
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
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  {...register("departmentName", {
                    required:
                      departmentStrings.addDepartment.validation
                        .departmentNameRequired,
                    minLength: {
                      value: 3,
                      message:
                        departmentStrings.addDepartment.validation
                          .departmentNameMinLength,
                    },
                    maxLength: {
                      value: 25,
                      message:
                        departmentStrings.addDepartment.validation
                          .departmentNameMaxLength,
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9 ]+$/,
                      message:
                        departmentStrings.addDepartment.validation
                          .deptNamePattern,
                    },
                  })}
                  type="text"
                  maxLength={25}
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
                {departmentName.length === 25 && (
                  <p className="text-red-500  text-sm mt-1">
                    Maximum 25 characters allowed
                  </p>
                )}
              </div>

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {
                    departmentStrings.addDepartment.formLabels
                      .selectOrganization
                  }
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleOrgClick}
                  className={`mt-1 p-2 w-full border ${
                    errors.organizationId ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
                >
                  {selectedOrg
                    ? selectedOrg.organizationName
                    : "Select Organization"}
                </div>
                {showOrgDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search organization..."
                      value={searchTerm}
                      onChange={handleOrgSearch}
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
                {errors.organizationId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.organizationId.message}
                  </p>
                )}
              </div>

              <div className="w-full relative">
                <label className="block text-sm font-medium text-gray-700">
                  {departmentStrings.addDepartment.formLabels.selectBranch}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={handleBranchClick}
                  className={`mt-1 p-2 w-full border ${
                    errors.branchId ? "border-red-500" : "border-gray-300"
                  } rounded-md cursor-pointer bg-white`}
                >
                  {selectedBranch ? selectedBranch.branchName : "Select Branch"}
                </div>
                {showBranchDropdown && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded-md shadow">
                    <input
                      type="text"
                      placeholder="Search branch..."
                      value={branchSearchTerm}
                      onChange={handleBranchSearch}
                      className="p-2 w-full border-b outline-none"
                    />
                    <ul
                      onScroll={handleBranchScroll}
                      className="max-h-40 overflow-auto"
                    >
                      {branches.map((branch) => (
                        <li
                          key={branch.id}
                          onClick={() => handleBranchSelect(branch)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {branch.branchName}
                        </li>
                      ))}
                      {loadingBranches && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          Loading...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
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

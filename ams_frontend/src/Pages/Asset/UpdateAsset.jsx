import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { updateAsset, setSelectedAsset } from "../../Features/slices/assetSlice";
import { toast } from "react-toastify";
import API from "../../App/api/axiosInstance";

const UpdateAsset = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { selectedAsset } = useSelector((state) => state.assetData);
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // State for dynamic dropdowns
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    uniqueId: "",
    description: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "ACTIVE",
    categoryId: "",
    locationId: "",
    assignedToUserId: "",
    branchId: "",
    departmentId: "",
  });

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await API.get("/branch");
        setBranches(response.data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    fetchBranches();
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    setIsVisible(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Populate form when selectedAsset changes
  useEffect(() => {
    if (selectedAsset) {
      setFormData({
        name: selectedAsset.name || "",
        uniqueId: selectedAsset.uniqueId || "",
        description: selectedAsset.description || "",
        brand: selectedAsset.brand || "",
        model: selectedAsset.model || "",
        serialNumber: selectedAsset.serialNumber || "",
        status: selectedAsset.status || "ACTIVE",
        categoryId: selectedAsset.categoryId || "",
        locationId: selectedAsset.locationId || "",
        assignedToUserId: selectedAsset.assignedToUserId || "",
        branchId: selectedAsset.branchId || "",
        departmentId: selectedAsset.departmentId || "",
      });

      // Fetch departments for the selected branch
      if (selectedAsset.branchId) {
        fetchDepartments(selectedAsset.branchId);
      }

      // Fetch users for the selected department
      if (selectedAsset.departmentId) {
        fetchUsers(selectedAsset.departmentId);
      }
    }
  }, [selectedAsset]);

  // Fetch departments when branch is selected
  const fetchDepartments = async (branchId) => {
    try {
      const response = await API.get(`/department?branchId=${branchId}`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  // Fetch users when department is selected
  const fetchUsers = async (departmentId) => {
    try {
      const response = await API.get(`/user?departmentId=${departmentId}&userRole=USER`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setFormData(prev => ({
      ...prev,
      branchId,
      departmentId: "",
      assignedToUserId: ""
    }));
    setDepartments([]);
    setUsers([]);
    if (branchId) {
      fetchDepartments(branchId);
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData(prev => ({
      ...prev,
      departmentId,
      assignedToUserId: ""
    }));
    setUsers([]);
    if (departmentId) {
      fetchUsers(departmentId);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        id: selectedAsset.id,
        ...formData
      };

      await dispatch(updateAsset(updateData)).unwrap();
      toast.success("Asset updated successfully!");
      onSuccess(); // Refresh the asset list
      handleClose();
    } catch (error) {
      toast.error(error.message || "Failed to update asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed overflow-scroll inset-0 px-1 md:px-0 bg-black bg-opacity-50 z-50 flex justify-center items-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className={`mt-[20px] w-[820px] min-h-96 bg-white shadow-md rounded-md transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Title and Close Button */}
        <div className="flex justify-between px-6 bg-[#3bc0c3] rounded-t-md items-center py-3">
          <h2 className="text-[17px] font-semibold text-white">Edit Asset</h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-5 px-10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Name*
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Unique ID*
                </label>
                <input
                  type="text"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Status*
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_REPAIR">Under Repair</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  rows={2}
                />
              </div>

              {/* Location Information */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Branch*
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleBranchChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Department*
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleDepartmentChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                  disabled={!formData.branchId}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  name="assignedToUserId"
                  value={formData.assignedToUserId}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  disabled={!formData.departmentId}
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
                disabled={loading}
              >
                Close
              </button>
              <button 
                type="submit"
                className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAsset;
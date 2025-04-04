import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { createAsset } from "../../Features/slices/assetSlice";
import API from "../../App/api/axiosInstance";

const AddAsset = ({ onClose, onSuccess }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.assetUserData);

  // State for dynamic dropdowns
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    assetName: "",  // Changed from 'name'
    uniqueId: "",
    description: "",
    brand: "",
    model: "",
    serialNumber: "",  // Changed from 'serialNumber'
    status: "ACTIVE",
    locationId: "",
    assignedToUserId: "",  // Changed from 'assignedUser'
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

  // Fetch departments when branch is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (formData.branchId) {
        try {
          const response = await API.get(`/department?branchId=${formData.branchId}`);
          setDepartments(response.data);
          // Reset department and user when branch changes
          setFormData(prev => ({
            ...prev,
            departmentId: "",
            assignedToUserId: ""
          }));
          setUsers([]);
        } catch (error) {
          console.error("Failed to fetch departments:", error);
        }
      } else {
        setDepartments([]);
        setUsers([]);
      }
    };

    fetchDepartments();
  }, [formData.branchId]);

  // Fetch users when department is selected
  useEffect(() => {
    const fetchUsers = async () => {
      if (formData.departmentId) {
        try {
          const response = await API.get(`/user?departmentId=${formData.departmentId}&userRole=USER`);
          setUsers(response.data);
          // Reset user when department changes
          setFormData(prev => ({
            ...prev,
            assignedToUserId: ""
          }));
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      } else {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [formData.departmentId]);

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
    try {
      await dispatch(createAsset(formData)).unwrap();
      onSuccess(); // Refresh the asset list
      handleClose();
    } catch (error) {
      console.error("Failed to create asset:", error);
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
          <h2 className="text-[17px] font-semibold text-white">Add Asset</h2>
          <button onClick={handleClose} className="text-white rounded-md">
            <IoClose className="h-7 w-7" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-5 px-10">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Asset Name*
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="assetName"  // Changed from 'name'
                  value={formData.assetName}
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
                  name="serialNumber"  // Changed from 'serialno'
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
                  <option value="IN_USE">In Use</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="RETIRED">Retired</option>
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
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}  {/* Changed from 'name' to 'branchName' */}
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
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  required
                  disabled={!formData.branchId}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}  {/* Changed from 'name' to 'departmentName' */}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  name="assignedToUserId"  // Changed from 'assignedUser'
                  value={formData.assignedToUserId}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                  disabled={!formData.departmentId}
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.userName} ({user.email})  {/* Changed from 'name' to 'userName' */}
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
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAsset;
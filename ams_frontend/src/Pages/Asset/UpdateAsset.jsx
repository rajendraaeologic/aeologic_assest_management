import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import SelectorAMSOWNER from "./SelectorAMSOWNER";

const UpdateAsset = ({ onClose }) => {
  const firstInputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Submitted!");
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
          <form onClick={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Name
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your name"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>

              <div className="w-full md:mt-4">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Name
                </label>
                <select
                  id="department"
                  name="department"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Department
                  </option>
                  <option value="accounts">Accounts</option>
                  <option value="bio">Bio</option>
                  <option value="hr">HR Department</option>
                </select>
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <select
                  id="code"
                  name="code"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                </select>
              </div>

              {/* row 2  */}

              <div className="w-full md:mt-4">
                <label
                  htmlFor="serialno"
                  className="block text-sm font-medium text-gray-700"
                >
                  Serial No
                </label>
                <input
                  type="text"
                  id="serialno"
                  name="serialno"
                  placeholder="Enter your serial no"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="assettype"
                  className="block text-sm font-medium text-gray-700"
                >
                  Asset Type
                </label>
                <input
                  type="text"
                  id="assettype"
                  name="assettype"
                  placeholder=" Enter your asset type"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="make"
                  className="block text-sm font-medium text-gray-700"
                >
                  Make
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  placeholder=" Enter your make"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              {/* Row 3 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="assetdetails"
                  className="block text-sm font-medium text-gray-700"
                >
                  Asset Details
                </label>
                <input
                  type="text"
                  id="assetdetails"
                  name="assetdetails"
                  placeholder=" Enter your asset details"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700"
                >
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  placeholder=" Enter your model"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="assetcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  MTK Asset Code
                </label>
                <input
                  type="text"
                  id="assetcode"
                  name="assetcode"
                  placeholder="Enter your asset code"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              {/* Row 4 */}
              <div className="w-full md:mt-4">
                <label
                  htmlFor="hardwaretype"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hardware Type
                </label>
                <input
                  type="text"
                  id="hardwaretype"
                  name="hardwaretype"
                  placeholder="Enter your hardware type"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Status
                  </option>
                  <option value="">Inventory</option>
                  <option value="">Assigned</option>
                </select>
              </div>
              <div className="w-[80%] md:mt-4">
                <label
                  htmlFor="contact-code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Asset_Type
                </label>
                <select
                  id="contact-code"
                  name="contact-code"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Asset_Type
                  </option>
                  <option value="code1">Working</option>
                  <option value="code2">Not Working</option>
                </select>
              </div>
              {/* Row 5 */}

              <div className="w-full md:mt-4">
                <label
                  htmlFor="awbnumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  AWB Number
                </label>
                <input
                  type="text"
                  id="awbnumber"
                  name="awbnumber"
                  placeholder="Enter your awb number"
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                />
              </div>
              <SelectorAMSOWNER></SelectorAMSOWNER>
              <div className="w-full md:mt-4">
                <label
                  htmlFor="usercode"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Code
                </label>
                <select
                  id="usercode"
                  name="usercode"
                  defaultValue=""
                  className="mt-1 p-2 w-full border border-gray-300 outline-none rounded-md"
                >
                  <option value="" disabled>
                    Code
                  </option>
                </select>
              </div>
            </div>
            <hr className="mt-4"></hr>
            <div className="flex justify-end gap-4 md:mt-4 mt-4 mb-2 mr-5">
              <button
                onClick={handleClose}
                className="px-3 py-2 bg-[#6c757d] text-white rounded-lg"
              >
                Close
              </button>
              <button className="px-3 py-2 bg-[#3bc0c3] text-white rounded-lg">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAsset;

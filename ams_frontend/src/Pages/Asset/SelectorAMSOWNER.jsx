import React, { useEffect, useRef, useState } from "react"; // Correct import
import { ChevronDownIcon } from "@heroicons/react/20/solid";
const SelectorAMSOWNER = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("AMS Owner");
  const dropdownRef = useRef(null);

  const options = [
    { value: "", label: "AMS Owner", disabled: true },
    { value: "code1", label: "Code 1" },
    { value: "code2", label: "Code 2" },
    { value: "code3", label: "Code 3" },
    { value: "code4", label: "Code 4" },
    { value: "code5", label: "Code 5" },
    { value: "code6", label: "Code 6" },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionSelect = (option) => {
    setSelectedValue(option.label);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:mt-4" ref={dropdownRef}>
      <label
        htmlFor="custom-dropdown"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        AMS Owner
      </label>
      <button
        id="custom-dropdown"
        className="w-full p-2 border border-gray-300 rounded-md text-left bg-white flex items-center justify-between"
        onClick={toggleDropdown}
      >
        {selectedValue}
        <ChevronDownIcon className="w-5 h-5 text-gray-500 ml-2" />
      </button>
      {isOpen && (
        <ul className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className={`pl-4 py-.5 ${
                option.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={() => !option.disabled && handleOptionSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectorAMSOWNER;

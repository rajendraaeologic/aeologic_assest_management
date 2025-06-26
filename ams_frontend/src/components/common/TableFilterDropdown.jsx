import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../Features/slices/userSlice';

const TableFilterDropdown = ({ filterType, options }) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const filters = useSelector((state) => state.usersData.filters || {});
    const selectedValue = filters[filterType] || null;

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleFilterChange = (value) => {
        const newFilters = { ...filters, [filterType]: value };
        dispatch(setFilters(newFilters));
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative  inline-block text-left pr-4" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full p-2 text-sm font-medium border rounded-md flex justify-between items-center cursor-pointer ${
                    selectedValue ? 'bg-[#3BC0C3] text-white' : 'bg-white text-gray-700 border-gray-300'
                } hover:bg-[#3BC0C3] hover:text-white transition`}
            >
                {selectedValue || filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <svg
                    className="ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full border border-gray-300 bg-white rounded-md shadow max-h-40 overflow-auto">
                    <ul>
                        {options.map((option) => (
                            <li
                                key={option.value || option}
                                onClick={() => handleFilterChange(option.label || option)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                                {option.label || option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TableFilterDropdown;

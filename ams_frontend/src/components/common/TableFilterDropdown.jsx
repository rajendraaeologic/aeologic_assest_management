import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../Features/slices/userSlice';

const TableFilterDropdown = ({ filterType, options }) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const filters = useSelector((state) => state.usersData.filters || {});
    const selectedValue = filters[filterType] || null;

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleFilterChange = (value) => {
        const newFilters = { ...filters, [filterType]: value };
        dispatch(setFilters(newFilters));
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left mr-2">
            <button
                type="button"
                onClick={toggleDropdown}
                className={`inline-flex justify-center w-full rounded-md px-4 py-2 text-sm font-medium ${
                    selectedValue ? 'bg-[#3BC0C3] text-white' : 'bg-white text-gray-700 border'
                } hover:bg-[#3BC0C3] hover:text-white focus:outline-none`}
            >
                {selectedValue || filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <svg
                    className="-mr-1 ml-2 h-5 w-5"
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
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.value || option}
                                onClick={() => handleFilterChange(option.label || option)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                {option.label || option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableFilterDropdown;
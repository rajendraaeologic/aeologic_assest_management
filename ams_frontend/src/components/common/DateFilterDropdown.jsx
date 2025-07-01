import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { setFilters } from "../../Features/slices/userSlice.js";

const DateFilterDropdown = () => {
    const dispatch = useDispatch();
    const [singleDate, setSingleDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const dropdownRef = useRef(null);

    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSingleDateChange = (e) => {
        const date = e.target.value;
        if (date > currentDate) return;

        setSingleDate(date);
        setFromDate("");
        setToDate("");
        setActiveFilter(date ? 'single' : null);

        dispatch(setFilters({
            selectedDate: date,
            fromDate: null,
            toDate: null
        }));

        setIsOpen(false);
    };

    const handleRangeDateChange = (type, value) => {
        if (value > currentDate) return;

        if (type === 'from') {
            setFromDate(value);
            if (toDate && value > toDate) {
                setToDate("");
            }
        } else {
            setToDate(value);
            if (fromDate && value < fromDate) {
                setFromDate("");
            }
        }
    };

    const applyRangeFilter = () => {
        if (fromDate && toDate) {
            dispatch(setFilters({
                fromDate,
                toDate,
                selectedDate: null
            }));
            setSingleDate(""); // Clear single date when applying range
            setActiveFilter('range');
            setIsOpen(false);
        }
    };

    const handleClearFilter = () => {
        setSingleDate("");
        setFromDate("");
        setToDate("");
        setActiveFilter(null);
        dispatch(setFilters({
            selectedDate: null,
            fromDate: null,
            toDate: null
        }));
    };

    const getDisplayText = () => {
        if (activeFilter === 'single') {
            return new Date(singleDate).toLocaleDateString();
        }
        if (activeFilter === 'range') {
            return `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`;
        }
        return "Date Wise";
    };

    return (
        <div className="relative mr-3" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 text-sm font-medium border rounded-md flex items-center gap-2 cursor-pointer ${
                    activeFilter
                        ? 'bg-[#3BC0C3] text-white'
                        : 'bg-white text-gray-700 border-gray-300'
                }`}
            >
                <FaCalendarAlt className="text-lg" />
                <span className="text-base md:text-sm">{getDisplayText()}</span>
                {activeFilter && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClearFilter();
                        }}
                        className="text-white hover:text-gray-200"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-[25rem] bg-white rounded-md shadow-lg z-20 p-4 border border-gray-200">
                    <div className="space-y-4">
                        {/* Single Date Selector */}
                        <div>
                            <h3 className="text-sm font-medium mb-2">Single Date</h3>
                            <input
                                type="date"
                                value={singleDate}
                                onChange={handleSingleDateChange}
                                max={currentDate}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                            />
                        </div>

                        <div className="border-t pt-3">
                            <h3 className="text-sm font-medium mb-2">Date Range</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => handleRangeDateChange('from', e.target.value)}
                                        max={toDate || currentDate}
                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => handleRangeDateChange('to', e.target.value)}
                                        min={fromDate || undefined}
                                        max={currentDate}
                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={applyRangeFilter}
                                disabled={!fromDate || !toDate}
                                className={`mt-2 w-full py-1 rounded ${
                                    fromDate && toDate
                                        ? "bg-[#3BC0C3] text-white hover:bg-[#2fa8ab]"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                Apply Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateFilterDropdown;
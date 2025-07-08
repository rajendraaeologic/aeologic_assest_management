import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { setFilters, clearFilters } from "../../Features/slices/userSlice.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateFilterDropdown = () => {
    const dispatch = useDispatch();
    const filters = useSelector(state => state.usersData.filters);
    const [singleDate, setSingleDate] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const dropdownRef = useRef(null);
    const [rangeError, setRangeError] = useState('');


    useEffect(() => {
        if (!filters.selectedDate && !filters.fromDate && !filters.toDate) {
            resetLocalState();
        }
    }, [filters]);

    useEffect(() => {
        if (filters.selectedDate) {
            setSingleDate(new Date(filters.selectedDate));
            setActiveFilter('single');
        } else if (filters.from_date || filters.to_date) {
            setFromDate(filters.from_date ? new Date(filters.from_date) : null);
            setToDate(filters.to_date ? new Date(filters.to_date) : null);
            setActiveFilter('range');
        }
    }, [filters]);

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

    const resetLocalState = () => {
        setSingleDate(null);
        setFromDate(null);
        setToDate(null);
        setActiveFilter(null);
    };

    const handleSingleDateChange = (date) => {
        if (!date) return;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        console.log('Dispatching date filter:', dateString);

        dispatch(setFilters({
            selectedDate: dateString,
            from_date: null,
            to_date: null
        }));

        setIsOpen(false);
    };
    const handleRangeDateChange = (type, date) => {
        if (!date) return;

        if (type === 'from') {
            setFromDate(date);
            if (toDate && date > toDate) {
                setToDate(null);
            }
        } else {
            setToDate(date);
            if (fromDate && date < fromDate) {
                setFromDate(null);
            }
        }
    };
    useEffect(() => {
        if (!isOpen) {
            setRangeError('');
        }
    }, [isOpen]);


    const applyRangeFilter = () => {
        setRangeError('');

        if ((fromDate && !toDate) || (!fromDate && toDate)) {
            setRangeError('Please select both start and end dates.');
            return;
        }

        if (fromDate || toDate) {
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            if (from) {
                from.setHours(0, 0, 0, 0);
            }
            if (to) {
                to.setHours(23, 59, 59, 999);
            }

            dispatch(setFilters({
                from_date: from ? from.toISOString() : null,
                to_date: to ? to.toISOString() : null,
                selectedDate: null
            }));
            setSingleDate(null);
            setActiveFilter('range');
            setIsOpen(false);
        }
    };

    const handleClearFilter = () => {
        resetLocalState();
        dispatch(clearFilters());
    };

    const getDisplayText = () => {
        if (activeFilter === 'single') {
            return `Date: ${singleDate?.toLocaleDateString() || ""}`;
        }
        if (activeFilter === 'range') {
            const fromText = fromDate?.toLocaleDateString() || "Start";
            const toText = toDate?.toLocaleDateString() || "End";
            return `From: ${fromText} - To: ${toText}`;
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
                            <DatePicker
                                selected={singleDate}
                                onChange={handleSingleDateChange}
                                maxDate={new Date()}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                                placeholderText="Select a date"
                                dateFormat="yyyy-MM-dd"
                            />
                        </div>

                        <div className="border-t pt-3">
                            <h3 className="text-sm font-medium mb-2">Date Range</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">From</label>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date) => handleRangeDateChange('from', date)}
                                        maxDate={toDate || new Date()}
                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                                        placeholderText="Start date"
                                        dateFormat="yyyy-MM-dd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">To</label>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date) => handleRangeDateChange('to', date)}
                                        minDate={fromDate}
                                        maxDate={new Date()}
                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#3BC0C3] focus:border-transparent"
                                        placeholderText="End date"
                                        dateFormat="yyyy-MM-dd"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={applyRangeFilter}
                                disabled={!fromDate && !toDate}
                                className={`mt-2 w-full py-1 rounded ${
                                    fromDate || toDate
                                        ? "bg-[#3BC0C3] text-white hover:bg-[#2fa8ab]"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                Apply Range
                            </button>
                            {rangeError && (
                                <p className="text-red-500 text-sm mt-1">{rangeError}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateFilterDropdown;
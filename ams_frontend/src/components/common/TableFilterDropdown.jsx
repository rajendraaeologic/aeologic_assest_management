import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../Features/slices/userSlice';
import API from '../../App/api/axiosInstance';
import { toast } from 'react-toastify';

const TableFilterDropdown = ({
     filterType,
     options = [],
     fetchOnOpen = false,
     apiUrl = null,
     responseDataKey = 'organizations',
     displayField = 'organizationName',
     valueField = 'id',
     placeholder = '',
     disabled = false
 }) => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [noItemsFound, setNoItemsFound] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const filters = useSelector((state) => state.usersData.filters || {});
    const selectedValue = filters[filterType] || null;

    const LIMIT = 5;

    const fetchOptions = async (pageNum, search = '') => {
        if (!apiUrl) return;

        try {
            setLoading(true);
            const response = await API.get(
                `${apiUrl}?page=${pageNum}&limit=${LIMIT}&searchTerm=${search}`
            );

            const responseData = response?.data?.data || {};
            const items = responseDataKey ? responseData[responseDataKey] : [];
            const pagination = responseData?.pagination || { totalPages: 0 };

            setDynamicOptions((prev) =>
                pageNum === 1 ? (items || []) : [...prev, ...(items || [])]
            );
            setNoItemsFound((!items || items.length === 0) && search !== "");
            setPage(pageNum);
            setHasMore(pageNum < (pagination?.totalPages || 0));
        } catch (error) {
            toast.error(`Error fetching ${filterType}`);
            console.error('Error fetching options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDropdownClick = async () => {
        if (disabled) return;

        const shouldFetch = !isOpen;
        setIsOpen((prev) => !prev);

        if (shouldFetch && fetchOnOpen && apiUrl) {
            if (searchTerm.trim() === "") {
                await fetchOptions(1, "");
            }
        }
    };

    const handleScroll = (e) => {
        const bottomReached =
            e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
        if (bottomReached && !loading && hasMore && apiUrl) {
            fetchOptions(page + 1, searchTerm);
        }
    };

    const handleSearch = (e) => {
        const search = e.target.value;
        setSearchTerm(search);
        setNoItemsFound(false);
        if (apiUrl) {
            fetchOptions(1, search);
        }
    };

    const handleItemSelect = (item) => {
        const value = item?.[valueField] || item?.id || item;
        const displayValue = item?.[displayField] || item?.name || item;

        setSelectedItem(item);
        const newFilters = { ...filters, [filterType]: displayValue };
        dispatch(setFilters(newFilters));
        setIsOpen(false);
        setSearchTerm("");
    };

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

    useEffect(() => {
        if (options && !fetchOnOpen) {
            setDynamicOptions(options);
        }
    }, [options, fetchOnOpen]);

    useEffect(() => {
        if (!isOpen && listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, [isOpen]);

    const getDisplayValue = () => {
        if (selectedValue) return selectedValue;
        if (placeholder) return placeholder;
        return filterType.charAt(0).toUpperCase() + filterType.slice(1);
    };

    return (
        <div className="relative inline-block text-left pr-4" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleDropdownClick}
                disabled={disabled}
                className={`w-full p-2 text-sm font-medium border rounded-md flex justify-between items-center cursor-pointer ${
                    selectedValue ? 'bg-[#3BC0C3] text-white' : 'bg-white text-gray-700 border-gray-300'
                } hover:bg-[#3BC0C3] hover:text-white transition ${
                    disabled ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                <span className="truncate">{getDisplayValue()}</span>
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

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-2 w-full border border-gray-300 bg-white rounded-md shadow">
                    {fetchOnOpen && (
                        <input
                            type="text"
                            placeholder={`Search ${filterType}...`}
                            value={searchTerm}
                            onChange={handleSearch}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                            className="p-2 w-full border-b outline-none"
                        />
                    )}
                    <ul
                        ref={listRef}
                        onScroll={fetchOnOpen ? handleScroll : null}
                        className="max-h-40 overflow-auto"
                    >
                        {dynamicOptions?.map((item, index) => {
                            const key = item?.[valueField] || item?.id || index;
                            const displayText = item?.[displayField] || item?.name || item;

                            return (
                                <li
                                    key={key}
                                    onClick={() => handleItemSelect(item)}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                    {displayText}
                                </li>
                            );
                        })}
                        {loading && (
                            <li className="px-4 py-2 text-sm text-gray-500">Loading...</li>
                        )}
                        {noItemsFound && !loading && (
                            <li className="px-4 py-2 text-sm text-gray-500">
                                No {filterType} found
                            </li>
                        )}
                        {!loading && !noItemsFound && dynamicOptions?.length === 0 && (
                            <li className="px-4 py-2 text-sm text-gray-500">
                                No options available
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TableFilterDropdown;
import React, { useState, useEffect, useContext, useCallback,useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SliderContext from "../../components/ContexApi";
import assetHistoryStrings from "../../locales/assetHistoryStrings";
import {
  FiClock,
  FiUser,
  FiLayers,
  FiTag,
  FiSettings,
  FiAlertCircle,
  FiCalendar,
  FiActivity,
  FiHardDrive,
  FiInfo,
  FiX,
} from "react-icons/fi";
import debounce from "lodash.debounce";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllAssetHistories,
  resetAssetHistoryTableState,
  setCurrentPage,
  setRowsPerPage,
  setSearchTerm
} from "../../Features/slices/assetHistorySlice.js";
import PaginationControls from "../../components/common/PaginationControls.jsx";
import SkeletonLoader from "../../components/common/SkeletonLoader/SkeletonLoader.jsx";
import {MdKeyboardArrowLeft} from "react-icons/md";
const options = ["5", "10", "25", "50", "100"];

const statusConfig = {
  ACTIVE: {
    color: "bg-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: <FiActivity className="text-green-600" />,
  },
  IN_ACTIVE: {
    color: "bg-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: <FiAlertCircle className="text-gray-600" />,
  },
  IN_USE: {
    color: "bg-blue-500",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: <FiHardDrive className="text-blue-600" />,
  },
  UNDER_MAINTENANCE: {
    color: "bg-yellow-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: <FiSettings className="text-yellow-600" />,
  },
  RETIRED: {
    color: "bg-red-500",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: <FiAlertCircle className="text-red-600" />,
  },
  ASSIGNED: {
    color: "bg-indigo-500",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-800",
    icon: <FiUser className="text-indigo-600" />,
  },
  UNASSIGNED: {
    color: "bg-purple-500",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    icon: <FiUser className="text-purple-600" />,
  },
  CREATED: {
    color: "bg-teal-500",
    bgColor: "bg-teal-100",
    textColor: "text-teal-800",
    icon: <FiLayers className="text-teal-600" />,
  },
  UPDATED: {
    color: "bg-cyan-500",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800",
    icon: <FiSettings className="text-cyan-600" />,
  },
  DELETED: {
    color: "bg-rose-500",
    bgColor: "bg-rose-100",
    textColor: "text-rose-800",
    icon: <FiAlertCircle className="text-rose-600" />,
  },
  LOST: {
    color: "bg-orange-500",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    icon: <FiAlertCircle className="text-orange-600" />,
  },
  DAMAGED: {
    color: "bg-red-500",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: <FiAlertCircle className="text-red-600" />,
  },
  IN_REPAIR: {
    color: "bg-amber-500",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    icon: <FiSettings className="text-amber-600" />,
  },
  DISPOSED: {
    color: "bg-gray-700",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: <FiAlertCircle className="text-gray-800" />,
  },
  DEFAULT: {
    color: "bg-gray-400",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: <FiInfo className="text-gray-600" />,
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "Date not available";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Date not available";

  return date.toLocaleString();
};

const TimelineEvent = ({ event, isLast, index }) => {
  const config =
      statusConfig[event.action] ||
      statusConfig[event.status] ||
      statusConfig.DEFAULT;

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{
            scale: 1.02,
            backgroundColor: "rgba(239, 246, 255, 0.7)",
            transition: { duration: 0.2 },
          }}
          className="relative pb-6 pl-3 pr-3 rounded-lg cursor-pointer group"
      >
        <div
            className={`absolute left-[-26px] top-1 h-5 w-5 rounded-full ${config.color} flex items-center justify-center z-10`}
        >
          <div className="text-white text-xs">
            {React.cloneElement(config.icon, { className: "h-3 w-3" })}
          </div>
        </div>

        {!isLast && (
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="absolute left-[-16px] top-6 w-0.5 bg-gray-300"
            />
        )}

        <div className="pl-6 py-2">
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="flex items-center text-xs text-gray-500"
          >
            <FiCalendar className="mr-1" />
            {formatDate(event.timestamp)}
          </motion.div>

          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.25 }}
              className="mt-1"
          >
            <div className="inline-block">
            <span className="font-medium capitalize flex items-center">
              {React.cloneElement(config.icon, { className: "mr-2" })}
              {event.action ? event.action.toLowerCase() : event.status.toLowerCase()}
              {event.status && event.action !== event.status && (
                  <span
                      className={`ml-2 text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}
                  >
                  {event.status.toLowerCase()}
                </span>
              )}
            </span>
              <motion.div
                  className="h-0.5 bg-blue-200"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
              />
            </div>
          </motion.div>

          {event.user && (
              <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="mt-2 flex items-center bg-gray-50 rounded-lg p-2"
              >
                <motion.div
                    className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2"
                    whileHover={{ scale: 1.1 }}
                >
                  <FiUser className="h-4 w-4 text-blue-600" />
                </motion.div>
                <div>
              <span className="text-sm text-gray-600 block">
                {event.user.userName || event.user.userName || "Unknown User"}
              </span>
                  <span className="text-xs text-gray-400">{event.user.email || "No email"}</span>
                </div>
              </motion.div>
          )}

          {event.description && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.35 }}
                  className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
              >
                {event.description}
              </motion.div>
          )}
        </div>
      </motion.div>
  );
};

const AssetHistory = () => {
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);
  const dispatch = useDispatch();
  const timelineRef = useRef(null);
  const timelineButtonRef = useRef(null);
  const {
    histories,
    loading,
    error,
    currentPage,
    rowsPerPage,
    totalHistories,
    totalPages,
    searchTerm,
  } = useSelector((state) => state.assetHistory);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const strings = assetHistoryStrings?.assetHistory || {
    title: "Asset History",
    loading: "Loading asset history...",
    noAssetsFound: "No assets found",
    noHistoryAvailable: "No history available for any assets",
    showDetails: "Show Details",
    hideDetails: "Hide Details",
    assetDetails: "Asset Details",
    historyTimeline: "History Timeline",
    breadcrumb: { dashboard: "Dashboard", assetHistory: "Asset History" },
  };
  const handleNavigate = () => {
    navigate("/dashboard");
  };

  const debouncedSearch = useCallback(
      debounce((value) => {
        dispatch(setSearchTerm(value));
        setIsSearching(false);
      }, 500),
      [dispatch]
  );
  useEffect(() => {
    dispatch(setSearchTerm(""));
    setLocalSearchTerm("");
    return () => {
      dispatch(setSearchTerm(""));
      setLocalSearchTerm("");
      dispatch(resetAssetHistoryTableState());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
        getAllAssetHistories({
          page: currentPage,
          limit: rowsPerPage,
          searchTerm: searchTerm.trim(),
        })
    );
  }, [dispatch, currentPage, rowsPerPage, searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setIsSearching(value.trim().length > 0);
    debouncedSearch(value);
  };

  const groupedHistories = useCallback(() => {
    if (!histories || histories.length === 0) return [];

    const grouped = {};

    histories.forEach((history) => {
      if (!history.asset || !history.asset.id) return;

      if (!grouped[history.asset.id]) {
        grouped[history.asset.id] = {
          asset: history.asset,
          histories: [],
        };
      }
      grouped[history.asset.id].histories.push(history);
    });

    // Sort each asset's histories by timestamp (oldest first for timeline)
    Object.values(grouped).forEach(group => {
      group.histories.sort((a, b) =>
          new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime()
      );
    });

    return Object.values(grouped);
  }, [histories]);

  const displayedGroupedHistories = groupedHistories();

  const getLatestAction = (latestHistory, currentStatus) => {
    if (!latestHistory) return "No recent actions";

    // If current status exists, use that to determine the last action
    if (currentStatus) {
      switch (currentStatus) {
        case "LOST":
          return "Asset marked as lost";
        case "UNASSIGNED":
          return `Asset unassigned from ${latestHistory.user.userName}`;
        case "ASSIGNED":
          return `Assigned to ${latestHistory.user.userName}`;
        case "ACTIVE":
          return "Asset activated";
        case "IN_ACTIVE":
          return "Asset deactivated";
        case "IN_USE":
          return "Asset put in use";
        case "UNDER_MAINTENANCE":
          return "Asset marked as under maintenance";
        case "RETIRED":
          return "Asset retired";
        case "DAMAGED":
          return "Asset marked as damaged";
        case "IN_REPAIR":
          return "Asset sent for repair";
        case "DISPOSED":
          return "Asset disposed";
        default:
          return currentStatus.toLowerCase();
      }
    }

    switch (latestHistory.action) {
      case "ASSIGNED":
        return `Assigned to ${latestHistory.user?.userName || latestHistory.user?.name || "user"}`;
      case "UNASSIGNED":
        return "Unassigned from previous user";
      case "STATUS_CHANGE":
        return `Status changed to ${latestHistory.status?.toLowerCase() || "new status"}`;
      case "CREATED":
        return "Asset created";
      case "UPDATED":
        return "Asset details updated";
      case "DELETED":
        return "Asset deleted";
      case "LOST":
        return "Asset marked as lost";
      case "DAMAGED":
        return "Asset marked as damaged";
      case "IN_REPAIR":
        return "Asset under repair";
      case "DISPOSED":
        return "Asset disposed";
      case "UNDER_MAINTENANCE":
        return "Asset marked as under_maintenance";
      default:
        return latestHistory.action?.toLowerCase() || "Unknown action";
    }
  };
  const handleViewDetails = async (assetData) => {
    try {
      setShowTimeline(true);
      setSelectedAsset(assetData); // Show existing data immediately

      // const result = await dispatch(getAssetHistoriesByAssetId({
      //   assetId: assetData.asset.id,
      //   limit: 5,
      //   page: 1,
      // }));

      if (result.payload && result.payload.data) {
        setSelectedAsset(prev => ({
          ...prev,
          histories: Array.isArray(result.payload.data) ?
              result.payload.data :
              result.payload.data.histories || []
        }));
      }
    } catch (error) {
      console.error("Error fetching asset histories:", error);
    }
  };

  useEffect(() => {
    if (selectedAsset && showTimeline) {
      const updatedAsset = histories.find(
          h => h.asset?.id === selectedAsset.asset.id
      )?.asset;

      if (updatedAsset) {
        setSelectedAsset(prev => {
          if (prev.asset.id === updatedAsset.id &&
              JSON.stringify(prev.asset) === JSON.stringify(updatedAsset)) {
            return prev;
          }
          return {
            ...prev,
            asset: updatedAsset
          };
        });
      }
    }
  }, [histories, selectedAsset?.asset.id, showTimeline]);

  const closeTimeline = () => {
    setShowTimeline(false);
    setSelectedAsset(null);
  };

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          !showTimeline ||
          timelineRef.current?.contains(event.target) ||
          timelineButtonRef.current?.contains(event.target)
      ) {
        return;
      }

      closeTimeline();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimeline]);

  return (
      <div
          className={`w-full min-h-screen bg-slate-100 px-2 ${
              isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
          }`}
      >
        <div
            className={`mx-auto min-h-screen transition-all duration-300 ${
                isSidebarOpen
                    ? "pl-0 md:pl-[250px] lg:pl-[250px]"
                    : "pl-0 md:pl-[90px] lg:pl-[90px]"
            }`}
        >
          <div className="pt-24">
            <div className="flex justify-between mx-5 mt-2">
              <h3 className="text-xl font-semibold text-[#6c757D] flex items-center">
                {strings.title}
              </h3>
            </div>
            <div className="mx-5 flex gap-2 mb-4 items-center">
              <button
                  onClick={handleNavigate}
                  className="text-[#6c757D] hover:text-blue-600 transition-colors flex items-center"
              >
                {strings.breadcrumb.dashboard}
              </button>
              <MdKeyboardArrowLeft className="h-6 w-6" />
              <p className="text-[#6c757D]">{strings.breadcrumb.assetHistory}</p>
            </div>
          </div>

          {/* Asset History Table */}
          <div className="min-h-[580px] pb-10 bg-white mt-3 ml-2 rounded-lg">
            <div className="flex items-center justify-between pt-8 px-6">
              {/* Left side: Show entries dropdown */}
              <div className="flex items-center gap-2">
                <p>Show</p>
                <div className="border-2 flex justify-evenly">
                  <select
                      value={rowsPerPage}
                      onChange={(e) =>
                          dispatch(setRowsPerPage(parseInt(e.target.value)))
                      }
                      className="outline-none px-1"
                  >
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                    ))}
                  </select>
                </div>
                <p>entries</p>
              </div>
              {/* Right side: Search bar */}
              <div className="relative">
                <input
                    type="text"
                    placeholder="Search"
                    className="border p-2 rounded w-64"
                    value={localSearchTerm}
                    onChange={handleSearchChange}
                />
                {isSearching && (
                    <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 animate-pulse">
                  Searching...
                </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow mt-5 mx-4">
              <table className="table-auto w-full text-left border-collapse">
                <thead className="bg-[#3bc0c3] text-white divide-y divide-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-[#2b9ea1]">
                    <div className="flex items-center">
                      Asset Name
                    </div>
                  </th>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-[#2b9ea1]">
                    <div className="flex items-center">
                      Current Status
                    </div>
                  </th>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-[#2b9ea1]" >
                    <div className="flex items-center">
                      Branch
                    </div>
                  </th>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-[#2b9ea1]" >
                    <div className="flex items-center">
                      Department
                    </div>
                  </th>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-[#2b9ea1]">
                    <div className="flex items-center">
                      Last Action
                    </div>
                  </th>
                  <th className="px-2 py-2 border border-gray-300 whitespace-nowrap">
                    Action
                  </th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <SkeletonLoader rows={5} columns={6} />
                ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-2 py-4 text-center border border-gray-300 text-red-500">
                        {error}
                      </td>
                    </tr>
                ) : displayedGroupedHistories.length === 0 ? (
                    <tr>
                      <td
                          colSpan="6"
                          className="px-2 py-4 text-center border border-gray-300"
                      >
                        {searchTerm ? "No assets found matching your search criteria." : "No data available"}
                      </td>
                    </tr>
                ) : (
                    displayedGroupedHistories.map(({ asset, histories }, index) => (
                        <tr
                            key={asset.id}
                            className={`${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-200 divide-y divide-gray-300`}
                        >
                          <td className="px-2 py-2 border border-gray-300 break-words align-top">
                            {asset.assetName}
                          </td>
                          <td className="px-2 py-2 border border-gray-300 break-words align-top">
          <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusConfig[asset.status]?.bgColor || "bg-gray-100"
              } ${
                  statusConfig[asset.status]?.textColor || "text-gray-800"
              }`}
          >
            {asset.status}
          </span>
                          </td>
                          <td className="px-2 py-2 border border-gray-300 break-words align-top">
                            {asset.branch?.branchName || "N/A"}
                          </td>
                          <td className="px-2 py-2 border border-gray-300 break-words align-top">
                            {asset.department?.departmentName || "N/A"}
                          </td>
                          <td className="px-2 py-2 border border-gray-300 break-words align-top">
                            {getLatestAction(histories[0], asset.status)}
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                  ref={timelineButtonRef}
                                  onClick={() => handleViewDetails({ asset, histories })}
                                  className="px-3 py-2 rounded-sm text-blue-600 underline hover:text-blue-800"
                              >
                                <span>View Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>

              </table>
            </div>
            {/* Pagination Controls */}
            {!loading && !error && displayedGroupedHistories.length > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    totalItems={totalHistories}
                    totalPages={totalPages}
                    onPrev={() => handlePageChange(currentPage - 1)}
                    onNext={() => handlePageChange(currentPage + 1)}
                    onPageChange={handlePageChange}
                    previousLabel="Previous"
                    nextLabel="Next"
                />
            )}
          </div>
        </div>

        {/* Timeline Sidebar */}
        <AnimatePresence>
          {showTimeline && selectedAsset && (
              <motion.div
                  ref={timelineRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="fixed right-0 top-0 h-full w-full md:w-96 lg:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiClock className="mr-2" />
                      Timeline History
                    </h2>

                    <div className="flex items-center gap-2">
                      {/*<button*/}
                      {/*    onClick={() => handleViewDetails(selectedAsset)}*/}
                      {/*    className="p-2 hover:bg-gray-100 rounded-full transition-colors"*/}
                      {/*    title="Refresh"*/}
                      {/*>*/}
                      {/*  <FiRefreshCw className="h-5 w-5 text-gray-500" />*/}
                      {/*</button>*/}
                      <button
                          onClick={closeTimeline}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <FiTag className="mr-2" />
                      Asset Name: {selectedAsset.asset.assetName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Unique ID: {selectedAsset.asset.uniqueId}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Asset Details Section */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FiInfo className="mr-2" />
                      Asset Details
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">

                      {selectedAsset.asset.branch?.branchName && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Branch:</span>
                            <span className="text-gray-800 font-medium">
                        {selectedAsset.asset.branch.branchName}
                      </span>
                          </div>
                      )}
                      {selectedAsset.asset.department?.departmentName && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Department:</span>
                            <span className="text-gray-800 font-medium">
                        {selectedAsset.asset.department.departmentName}
                      </span>
                          </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Status:</span>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusConfig[selectedAsset.asset.status]?.bgColor ||
                                "bg-gray-100"
                            } ${
                                statusConfig[selectedAsset.asset.status]?.textColor ||
                                "text-gray-800"
                            }`}
                        >
                      {selectedAsset.asset.status}
                    </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FiActivity className="mr-2" />
                      History Timeline
                    </h4>
                    <div className="border-l-2 border-gray-200 pl-4 ml-2">
                      {selectedAsset.histories && selectedAsset.histories.length > 0 ? (
                          <>
                            {selectedAsset.histories.map((history, index) => (
                                <TimelineEvent
                                    key={history.id || index}
                                    event={history}
                                    isLast={index === selectedAsset.histories.length - 1}
                                    index={index}
                                />
                            ))}
                          </>
                      ) : (
                          <p className="text-gray-500 text-sm italic">
                            No history records available for this asset
                          </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {showTimeline && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeTimeline}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            />
        )}
      </div>
  );
};

export default AssetHistory;
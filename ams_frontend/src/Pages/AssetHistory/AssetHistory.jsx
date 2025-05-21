import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fade } from "react-awesome-reveal";
import API from "../../App/api/axiosInstance";
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
  FiChevronRight,
} from "react-icons/fi";
import { CiSaveUp2 } from "react-icons/ci";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const statusConfig = {
  ACTIVE: {
    color: "bg-green-500",
    icon: <FiActivity className="text-green-600" />,
  },
  IN_ACTIVE: {
    color: "bg-gray-500",
    icon: <FiAlertCircle className="text-gray-600" />,
  },
  IN_USE: {
    color: "bg-blue-500",
    icon: <FiHardDrive className="text-blue-600" />,
  },
  UNDER_MAINTENANCE: {
    color: "bg-yellow-500",
    icon: <FiSettings className="text-yellow-600" />,
  },
  RETIRED: {
    color: "bg-red-500",
    icon: <FiAlertCircle className="text-red-600" />,
  },
  ASSIGNED: {
    color: "bg-indigo-500",
    icon: <FiUser className="text-indigo-600" />,
  },
  UNASSIGNED: {
    color: "bg-purple-500",
    icon: <FiUser className="text-purple-600" />,
  },
  CREATED: {
    color: "bg-teal-500",
    icon: <FiLayers className="text-teal-600" />,
  },
  UPDATED: {
    color: "bg-cyan-500",
    icon: <FiSettings className="text-cyan-600" />,
  },
  DELETED: {
    color: "bg-rose-500",
    icon: <FiAlertCircle className="text-rose-600" />,
  },
  LOST: {
    color: "bg-orange-500",
    icon: <FiAlertCircle className="text-orange-600" />,
  },
  DAMAGED: {
    color: "bg-red-500",
    icon: <FiAlertCircle className="text-red-600" />,
  },
  IN_REPAIR: {
    color: "bg-amber-500",
    icon: <FiSettings className="text-amber-600" />,
  },
  DISPOSED: {
    color: "bg-gray-700",
    icon: <FiAlertCircle className="text-gray-800" />,
  },
  DEFAULT: {
    color: "bg-gray-400",
    icon: <FiInfo className="text-gray-600" />,
  },
};

const DetailItem = ({ label, value, icon }) => (
  <div className="flex justify-between text-sm mb-2">
    <span className="text-gray-600 font-medium flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}:
    </span>
    <span className="text-gray-800 text-right">{value || "N/A"}</span>
  </div>
);

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
          className="absolute left-[-16px] top-6 w-0.5 bg-gradient-to-b from-gray-200 to-transparent"
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
            {event.timestamp ? new Date(event.timestamp).toLocaleString() : "Date not available"}
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
              {event.action.toLowerCase()}
              {event.status && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
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
                {event.user.userName}
              </span>
              <span className="text-xs text-gray-400">{event.user.email}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AssetNameWithTooltip = ({ asset }) => (
  <div className="relative group inline-block">
    <motion.span
      className="hover:underline cursor-pointer text-lg font-semibold flex items-center"
      whileHover={{ color: "#3B82F6" }}
    >
      <FiTag className="mr-2" />
      <span>Asset Name : {asset.assetName} </span>

      <FiChevronRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.span>

    <motion.div
      className="absolute hidden group-hover:block z-20 w-72 p-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 before:absolute before:-top-2 before:left-4 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-t before:border-l before:border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 border-b pb-2 flex items-center">
          <FiInfo className="mr-2" />
          Asset Details
        </h4>
        <DetailItem
          label="Asset Name "
          value={asset.assetName}
          icon={<FiTag className="text-gray-500" />}
        />
        <DetailItem
          label="Unique ID"
          value={asset.uniqueId}
          icon={<FiLayers className="text-gray-500" />}
        />
        <DetailItem
          label="Model"
          value={asset.model || "N/A"}
          icon={<FiHardDrive className="text-gray-500" />}
        />
        <DetailItem
          label="Serial Number"
          value={asset.serialNumber || "N/A"}
          icon={<FiSettings className="text-gray-500" />}
        />
        <DetailItem
          label="Brand"
          value={asset.brand || "N/A"}
          icon={<FiActivity className="text-gray-500" />}
        />
        <DetailItem
          label="Status"
          value={
            <span
              className={`px-2 py-1 rounded-full text-xs flex items-center ${
                asset.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : asset.status === "IN_USE"
                  ? "bg-blue-100 text-blue-800"
                  : asset.status === "UNDER_MAINTENANCE"
                  ? "bg-yellow-100 text-yellow-800"
                  : asset.status === "RETIRED"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {statusConfig[asset.status]?.icon &&
                React.cloneElement(statusConfig[asset.status].icon, {
                  className: "mr-1 h-3 w-3",
                })}
              {asset.status}
            </span>
          }
          icon={<FiActivity className="text-gray-500" />}
        />
      </div>
    </motion.div>
  </div>
);

const AssetHistory = () => {
  const [expandedIds, setExpandedIds] = useState([]);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useContext(SliderContext);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await API.get("/assetHistory/");
        if (response.data?.success) {
          const groupedHistories = groupByAsset(response.data.data);
          setHistories(groupedHistories);
          if (groupedHistories.length === 0)
            setError(strings.noHistoryAvailable);
        } else
          throw new Error(response.data?.message || "Failed to fetch data");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Unknown error occurred"
        );
        if (err?.response?.status === 404) setError(strings.noAssetsFound);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupByAsset = (histories) => {
    if (!histories || histories.length === 0) return [];
    const grouped = {};
    histories.forEach((history) => {
      if (!history.asset) return;
      if (!grouped[history.assetId])
        grouped[history.assetId] = { asset: history.asset, histories: [] };
      grouped[history.assetId].histories.push(history);
    });
    Object.keys(grouped).forEach((assetId) => {
      grouped[assetId].histories.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    });
    return Object.values(grouped);
  };

  const toggleDetails = (assetId) => {
    setExpandedIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const getLatestAction = (latestHistory) => {
    if (!latestHistory) return "No recent actions";
    switch (latestHistory.action) {
      case "ASSIGNED":
        return `Assigned to ${latestHistory.user?.userName || "user"}`;
      case "UNASSIGNED":
        return "Unassigned from previous user";
      case "STATUS_CHANGE":
        return `Status changed to ${
          latestHistory.status?.toLowerCase() || "new status"
        }`;
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
        return latestHistory.action.toLowerCase();
    }
  };


  const findCreationDate = (assetId, histories) => {
    const createdEvent = histories.find(h => h.action === "CREATED");
    if (createdEvent && createdEvent.timestamp) {
      return new Date(createdEvent.timestamp);
    }
    if (histories.length > 0) {
      const oldestEvent = [...histories].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )[0];
      if (oldestEvent && oldestEvent.timestamp) {
        return new Date(oldestEvent.timestamp);
      }
    }
    return null;
  };
  const createCreatedEvent = (asset, histories) => {
    const hasCreatedEvent = histories.some(h => h.action === "CREATED");
    if (hasCreatedEvent) return null;
    const creationDate = findCreationDate(asset.id, histories);
    return {
      id: `created-${asset.id}`,
      action: "CREATED",
      timestamp: creationDate ? creationDate.toISOString() : asset.createdAt || new Date().toISOString(),
      assetId: asset.id,
      asset: asset
    };
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"
          />
          <p className="text-gray-600">{strings.loading}</p>
        </motion.div>
      </div>
    );

  if (error || histories.length === 0)
    return (
      <div
        className={`w-full min-h-screen bg-slate-100 px-2 ${
          isSidebarOpen
            ? "overflow-hidden"
            : "overflow-y-auto overflow-x-hidden"
        }`}
      >
        <div
          className={`mx-auto min-h-screen ${
            isSidebarOpen
              ? "pl-0 md:pl-[250px] lg:pl-[250px]"
              : "pl-0 md:pl-[90px] lg:pl-[90px]"
          }`}
        >
          <div className="pt-24">
            <div className="flex justify-between mx-5 mt-2">
              <h3 className="text-xl font-semibold text-[#6c757D]">
                {strings.title}
              </h3>
              <div className="flex gap-3 md:mr-8">
                <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg hover:bg-[#2fa8ab] transition-colors">
                  <CiSaveUp2 className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="mx-5 flex gap-2 mb-4 items-center">
              <button
                onClick={handleNavigate}
                className="text-[#6c757D] hover:text-blue-600 transition-colors flex items-center"
              >
                {strings.breadcrumb.dashboard}
              </button>
              <FiChevronRight className="text-gray-400" />
              <p className="text-[#6c757D]">
                {strings.breadcrumb.assetHistory}
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center min-h-[50vh]"
          >
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiAlertCircle className="h-16 w-16 mx-auto" />
                </motion.div>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {error || strings.noAssetsFound}
              </h3>
              <p className="text-gray-600">
                {error === strings.noAssetsFound
                  ? "There are no assets available to show history for."
                  : "Please check back later or contact support if you believe this is an error."}
              </p>
              <button
                onClick={handleNavigate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );

  return (
      <div
          className={`w-full min-h-screen bg-slate-100 px-2 ${
              isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
          }`}
      >
        <div
            className={`mx-auto min-h-screen ${
                isSidebarOpen
                    ? "pl-0 md:pl-[250px] lg:pl-[250px]"
                    : "pl-0 md:pl-[90px] lg:pl-[90px]"
            }`}
        >
          <div className="pt-24">
            <div className="flex justify-between mx-5 mt-2">
              <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-semibold text-[#6c757D] flex items-center"
              >
                <FiClock className="mr-2" />
                {strings.title}
              </motion.h3>
              <div className="flex gap-3 md:mr-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg hover:bg-[#2fa8ab] transition-colors flex items-center"
                >
                  <CiSaveUp2 className="h-6 w-6 mr-1" />
                  Export
                </motion.button>
              </div>
            </div>
            <div className="mx-5 flex gap-2 mb-4 items-center">
              <button
                  onClick={handleNavigate}
                  className="text-[#6c757D] hover:text-blue-600 transition-colors flex items-center"
              >
                {strings.breadcrumb.dashboard}
              </button>
              <FiChevronRight className="text-gray-400" />
              <p className="text-[#6c757D]">{strings.breadcrumb.assetHistory}</p>
            </div>
          </div>
          <div className="bg-slate-100 min-h-screen pb-4">
            <Fade cascade damping={0.1} triggerOnce>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                {histories.map(({ asset, histories }) => {
                  const createdEvent = createCreatedEvent(asset, histories);
                  const allEvents = createdEvent
                      ? [...histories, createdEvent].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      : histories;

                  return (
                      <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 self-start border border-gray-100"
                      >
                        <div className="mb-4">
                          <AssetNameWithTooltip asset={asset} />
                          <div className="flex items-center mt-2 text-gray-500">
                            <FiActivity className="mr-2" />
                            <span>Current Status: </span>
                            <span className="ml-1 capitalize font-medium">
                          {asset.status.toUpperCase()}
                        </span>
                          </div>
                          {histories.length > 0 && (
                              <div className="flex items-center mt-2 text-gray-500">
                                <FiClock className="mr-2" />
                                <span>Last Action: </span>
                                <span className="ml-1 font-medium">
                            {getLatestAction(histories[0])}
                          </span>
                              </div>
                          )}
                          {asset.assignedUser && (
                              <div className="flex items-center mt-2 text-gray-500">
                                <FiUser className="mr-2" />
                                <span>Assigned to: </span>
                                <span className="ml-1 font-medium">
                            {asset.assignedUser.userName ||
                                asset.assignedUser.email}
                          </span>
                              </div>
                          )}
                        </div>
                        <motion.button
                            onClick={() => toggleDetails(asset.id)}
                            whileHover={{ color: "#3B82F6" }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          {expandedIds.includes(asset.id) ? (
                              <>
                                <MdExpandLess className="mr-1" />
                                {strings.hideDetails}
                              </>
                          ) : (
                              <>
                                <MdExpandMore className="mr-1" />
                                {strings.showDetails}
                              </>
                          )}
                        </motion.button>
                        <AnimatePresence>
                          {expandedIds.includes(asset.id) && (
                              <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="space-y-6">
                                    <div>
                                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <FiInfo className="mr-2" />
                                        {strings.assetDetails}
                                      </h3>
                                      {asset.company?.organizationName && (
                                          <DetailItem
                                              label="Organization"
                                              value={asset.company.organizationName}
                                              icon={<FiLayers />}
                                          />
                                      )}
                                      {asset.branch?.branchName && (
                                          <DetailItem
                                              label="Branch"
                                              value={asset.branch.branchName}
                                              icon={<FiSettings />}
                                          />
                                      )}
                                      {asset.department?.departmentName && (
                                          <DetailItem
                                              label="Department"
                                              value={asset.department.departmentName}
                                              icon={<FiHardDrive />}
                                          />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <FiClock className="mr-2" />
                                        {strings.historyTimeline}
                                      </h3>
                                      <div className="border-l-2 border-gray-200 pl-4 ml-2">
                                        {allEvents.length > 0 ? (
                                            allEvents.map((history, index) => (
                                                <TimelineEvent
                                                    key={history.id}
                                                    event={history}
                                                    isLast={index === allEvents.length - 1}
                                                    index={index}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">
                                              No history records available for this asset
                                            </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                  );
                })}
              </div>
            </Fade>
          </div>
        </div>
      </div>
  );
};

export default AssetHistory;
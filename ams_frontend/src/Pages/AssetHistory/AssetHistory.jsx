import React, { useState, useEffect } from "react";
import API from "../../App/api/axiosInstance";
import { CiSaveUp2 } from "react-icons/ci";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import SliderContext from "../../components/ContexApi";
import assetHistoryStrings from "../../locales/assetHistoryStrings.js";

// Reusable detail component
const DetailItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}:</span>
        <span className="text-gray-800">{value}</span>
    </div>
);

// Timeline event component
const TimelineEvent = ({ date, action }) => (
    <div className="flex mb-4">
        <div className="mr-3 flex flex-col items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="h-full w-0.5 bg-gray-300"></div>
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{new Date(date).toLocaleDateString()}</p>
            <h4 className="text-md font-semibold text-gray-800">{action}</h4>
        </div>
    </div>
);

const AssetHistory = () => {
    const [expandedIds, setExpandedIds] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isSidebarOpen } = useContext(SliderContext);
    // Use the correct reference to strings based on how it's exported
    const strings = assetHistoryStrings?.assetHistory || {
        title: "Asset History",
        loading: "Loading asset history...",
        noHistory: "No asset history found",
        showDetails: "Show Details",
        hideDetails: "Hide Details",
        assetDetails: "Asset Details",
        historyDetails: "History Timeline",
        breadcrumb: {
            dashboard: "Dashboard",
            assetHistory: "Asset History"
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await API.get("/assetHistory");

                if (response.data?.success) {
                    setData(response.data);
                } else {
                    throw new Error(response.data?.message || "Failed to fetch data");
                }
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                    err.message ||
                    "Unknown error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleDetails = (assetId) => {
        if (expandedIds.includes(assetId)) {
            setExpandedIds(expandedIds.filter((id) => id !== assetId));
        } else {
            setExpandedIds([...expandedIds, assetId]);
        }
    };

    const handleNavigate = () => {
        navigate("/dashboard");
    };

    if (loading) {
        return (
            <div className="bg-slate-100 min-h-screen px-6 pt-24">
                {strings.loading}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-100 min-h-screen pt-24 px-6 text-red-500">
                {error}
            </div>
        );
    }

    if (!data?.data?.length) {
        return (
            <div className="bg-slate-100 min-h-screen pt-24 px-6">
                {strings.noHistory}
            </div>
        );
    }

    return (
        <div className={`w-full min-h-screen bg-slate-100 px-2 ${
            isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
        }`}>
            <div className={`mx-auto min-h-screen ${
                isSidebarOpen
                    ? "pl-0 md:pl-[250px] lg:pl-[250px]"
                    : "pl-0 md:pl-[90px] lg:pl-[90px]"
            }`}>
                <div className="pt-24">
                    <div className="flex justify-between mx-5 mt-2">
                        <h3 className="text-xl font-semibold text-[#6c757D]">
                            {strings.title}
                        </h3>
                        <div className="flex gap-3 md:mr-8">
                            <button className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg">
                                <CiSaveUp2 className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="mx-5 flex gap-2 mb-4">
                        <button onClick={handleNavigate} className="text-[#6c757D]">
                            {strings.breadcrumb.dashboard}
                        </button>
                        <span>
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </span>
                        <p className="text-[#6c757D]">{strings.breadcrumb.assetHistory}</p>
                    </div>
                </div>

                <div className="bg-slate-100 min-h-screen pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                        {data.data.map((history) => (
                            <div
                                key={history.id}
                                className="bg-white rounded-lg shadow-md p-6 self-start"
                            >
                                {/* Basic Info */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {history.assetName}
                                    </h2>
                                    <p className="text-gray-600">
                                        {strings.assetId}: {history.assetId || history.uniqueId}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {strings.historyDate}: {new Date(history.date).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Expand Button */}
                                <button
                                    onClick={() => toggleDetails(history.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    {expandedIds.includes(history.id)
                                        ? strings.hideDetails
                                        : strings.showDetails}
                                </button>

                                {/* Expanded Details */}
                                {expandedIds.includes(history.id) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="space-y-4">
                                            {/* Asset Details */}
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">
                                                    {strings.assetDetails}
                                                </h3>
                                                <DetailItem
                                                    label={strings.organization}
                                                    value={history.organization?.organizationName || "N/A"}
                                                />
                                                <DetailItem
                                                    label={strings.branch}
                                                    value={history.branch?.branchName || "N/A"}
                                                />
                                                <DetailItem
                                                    label={strings.department}
                                                    value={history.department?.departmentName || "N/A"}
                                                />
                                                <DetailItem
                                                    label={strings.action}
                                                    value={history.action}
                                                />

                                            </div>

                                            {/* History Timeline */}
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-3">
                                                    {strings.historyDetails}
                                                </h3>
                                                <div className="border-l-2 border-gray-200 pl-4 ml-2 space-y-2">
                                                    {/* Current event */}
                                                    <div className="relative pb-4">
                                                        <div className="absolute left-[-15px] top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                                        <p className="text-xs text-gray-500">{new Date(history.date).toLocaleDateString()}</p>
                                                        <p className="font-medium">{history.action}</p>
                                                    </div>

                                                    {/* Previous history events - example of how they would render */}
                                                    {history.previousEvents && history.previousEvents.map((event, index) => (
                                                        <div key={index} className="relative pb-4">
                                                            <div className="absolute left-[-15px] top-1 h-3 w-3 rounded-full bg-gray-400"></div>
                                                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                                            <p className="font-medium">{event.action}</p>
                                                        </div>
                                                    ))}

                                                    {/* Starting point */}
                                                    <div className="relative">
                                                        <div className="absolute left-[-15px] top-1 h-3 w-3 rounded-full bg-green-500"></div>
                                                        <p className="text-xs text-gray-500">{strings.created}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetHistory;
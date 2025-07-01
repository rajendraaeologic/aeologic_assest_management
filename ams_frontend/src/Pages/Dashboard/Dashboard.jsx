import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import SliderContext from "../../components/ContexApi";
import dashboardStrings from "../../locales/dashboardStrings";
import API from "../../App/api/axiosInstance";
import { selectCurrentUser } from "../../Features/auth/authSlice";
import { useSelector } from "react-redux";
import { USER_ROLES } from "../../TypeRoles/constants.roles";
import { Navigate } from "react-router-dom";
import {
  FaBriefcase,
  FaBuilding,
  FaCodeBranch,
  FaSyncAlt,
  FaTags,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { GiAudioCassette } from "react-icons/gi";

const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-300 h-24 rounded-lg shadow-lg"></div>
);

const Dashboard = () => {

  const user = useSelector(selectCurrentUser);
  const { isSidebarOpen } = useContext(SliderContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [refreshKey, setRefreshKey] = useState(0);

  if (user?.userRole === USER_ROLES.USER) {
    return <Navigate to="/user-dashboard" replace />;
  }

  const periodOptions = [
    { label: "7 days", value: "7days" },
    { label: "4 weeks", value: "4weeks" },
    { label: "6 months", value: "6months" },
    { label: "12 months", value: "12months" },
  ];

  const iconMap = {
    Users: (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-md">
          <FaUsers className="text-blue-600 w-5 h-5" />
        </div>
    ),
    Organizations: (
        <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-md">
          <FaBuilding className="text-green-600 w-5 h-5" />
        </div>
    ),
    Branches: (
        <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-md">
          <FaCodeBranch className="text-purple-600 w-5 h-5" />
        </div>
    ),
    Departments: (
        <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-md">
          <FaBriefcase className="text-yellow-500 w-5 h-5" />
        </div>
    ),
    Assets: (
        <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-md">
          <GiAudioCassette className="text-yellow-500 w-5 h-5" />
        </div>
    ),
    "Assign Tags": (
        <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-md">
          <FaTags className="text-red-500 w-5 h-5" />
        </div>
    ),
    "Out For Delivery": (
        <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-md">
          <FaTruck className="text-teal-500 w-5 h-5" />
        </div>
    ),
  };

  const fetchDashboardCounts = useCallback(async (period = "7days") => {
    try {
      setLoading(true);
      const res = await API.get(`/dashboard/counts?period=${period}`);

      if (res.status === 200 && res.data?.data) {
        const {
          users,
          organizations,
          branches,
          departments,
          assets,
          outForDelivery,
        } = res.data.data.counts;
console.log(res)
        const data = [
          {
            name: dashboardStrings.dashboard.stats.users,
            value: users,
            color: "#3B82F6",
          },
          {
            name: dashboardStrings.dashboard.stats.organizations,
            value: organizations,
            color: "#210F37",
          },
          {
            name: dashboardStrings.dashboard.stats.branches,
            value: branches,
            color: "#fc0380",
          },
          {
            name: dashboardStrings.dashboard.stats.departments,
            value: departments,
            color: "#10B981",
          },
          {
            name: dashboardStrings.dashboard.stats.assets,
            value: assets,
            color: "#FBBF24",
          },
          {
            name: dashboardStrings.dashboard.stats.assignTags,
            value: 4,
            color: "#EF4444",
          },
          {
            name: dashboardStrings.dashboard.stats.outForDelivery,
            value: outForDelivery || 0,
            color: "#14B8A6",
          },
        ];
        setChartData(data);
      }
    } catch (error) {
      console.error("Dashboard API Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePeriodChange = useCallback(
      (period) => {
        setSelectedPeriod(period);
        fetchDashboardCounts(period);
      },
      [fetchDashboardCounts]
  );

  const handleRefresh = useCallback(() => {
    setSelectedPeriod("7days");
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    fetchDashboardCounts(selectedPeriod);
  }, [fetchDashboardCounts, selectedPeriod, refreshKey]);

  return (
      <div
          className={`w-full bg-slate-100 p-6 pt-24 ${
              isSidebarOpen
                  ? "lg:fixed lg:h-screen lg:overflow-hidden md:overflow-y-scroll overflow-y-scroll"
                  : "min-h-screen overflow-auto"
          }`}
      >
        <div
            className={`mx-auto ${
                isSidebarOpen
                    ? "pl-0 md:pl-[250px] lg:pl-[250px]"
                    : "pl-0 md:pl-[90px] lg:pl-[90px]"
            }`}
        >
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {dashboardStrings.dashboard.title}
              </h1>
              <p className="text-gray-500 mt-4 font-medium">
                Monitor your programs performance with real-time data and insights
                across all engagement metrics.
              </p>
              <div className="md:mt-6 flex space-x-2">
                {periodOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handlePeriodChange(option.value)}
                        className={`px-4 py-1 border rounded-md text-lg font-medium transition ${
                            selectedPeriod === option.value
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {option.label}
                    </button>
                ))}
              </div>
            </div>

            <div className="md:mt-4 flex space-x-2">
              <button
                  onClick={handleRefresh}
                  className="ml-2 px-4 py-1 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 transition flex items-center space-x-1"
              >
                <FaSyncAlt className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-8xl pt-4">
            {loading
                ? Array(7)
                    .fill(0)
                    .map((_, idx) => <SkeletonCard key={idx} />)
                : chartData.map((item) => (
                    <motion.div
                        key={item.name}
                        className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow duration-200 w-full h-36 flex flex-col justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {iconMap[item.name] || (
                            <div className="w-5 h-5 bg-gray-300 rounded-full" />
                        )}
                        <h6 className="text-2xl font-semibold text-gray-700">
                          {item.name}
                        </h6>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {item.value}
                      </h2>
                    </motion.div>
                ))}
          </div>

          {/* Chart Section */}
          <div className="bg-gray-800 p-6 mt-6 rounded-xl shadow-2xl w-full">
            <h3 className="text-2xl font-semibold text-white mb-4">
              {dashboardStrings.dashboard.assetOverview}
            </h3>

            <div className={isSidebarOpen ? "h-[150px]" : "h-[200px]"}>
              {loading ? (
                  <div className="animate-pulse bg-gray-700 h-full w-full rounded-xl"></div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                      <XAxis dataKey="name" tick={{ fill: "#fff" }} />
                      <YAxis tick={{ fill: "#fff" }} />
                      <Tooltip
                          contentStyle={{
                            backgroundColor:
                            dashboardStrings.dashboard.chart.tooltip.backgroundColor,
                            borderRadius:
                            dashboardStrings.dashboard.chart.tooltip.borderRadius,
                            border: dashboardStrings.dashboard.chart.tooltip.border,
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#fff" }}
                          itemStyle={{ color: "#fff" }}
                          cursor={{ fill: "rgba(255,255,255,0.2)" }}
                      />
                      <Legend verticalAlign="top" wrapperStyle={{ color: "#fff" }} />
                      <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1200}
                      >
                        {chartData.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={entry.color}
                                style={{
                                  filter: `drop-shadow(0px 0px 10px ${entry.color})`,
                                }}
                            />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
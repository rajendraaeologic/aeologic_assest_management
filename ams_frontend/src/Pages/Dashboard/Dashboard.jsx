import React, { useState, useEffect, useContext } from "react";
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
import dashboardStrings from "../../locales/DashboardStrings";
import API from "../../App/api/axiosInstance";

const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-300 h-24 rounded-lg shadow-lg"></div>
);

const Dashboard = () => {
  const { isSidebarOpen } = useContext(SliderContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardCounts = async () => {
      try {
        const res = await API.get("/dashboard/counts");
        if (res.status === 200 && res.data?.data && isMounted) {
          const { users, organizations, branches, departments, assets } =
            res.data.data;

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
              value: 4,
              color: "#14B8A6",
            },
          ];
          setChartData(data);
        }
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`w-full bg-slate-100 p-6 ${
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
        <h1 className="text-3xl font-bold mb-6">
          {dashboardStrings.dashboard.title}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl pt-4">
          {loading
            ? Array(7)
                .fill(0)
                .map((_, idx) => <SkeletonCard key={idx} />)
            : chartData.map((item) => (
                <motion.div
                  key={item.name}
                  className="py-2 px-2 rounded-lg shadow-lg text-white"
                  style={{ backgroundColor: item.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold">{item.value}</h2>
                  <h6 className="text-lg font-bold mt-2">{item.name}</h6>
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
                        dashboardStrings.dashboard.chart.tooltip
                          .backgroundColor,
                      borderRadius:
                        dashboardStrings.dashboard.chart.tooltip.borderRadius,
                      border: dashboardStrings.dashboard.chart.tooltip.border,
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.2)" }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ color: "#fff" }}
                  />
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

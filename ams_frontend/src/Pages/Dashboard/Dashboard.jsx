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
import SliderContext from "../../components/ContexApi";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrganizations } from "../../Features/slices/organizationSlice";
import { getAllBranches } from "../../Features/slices/branchSlice";
import { getAllDepartments } from "../../Features/slices/departmentSlice";
import dashboardStrings from "../../locales/DashboardStrings";

const Dashboard = () => {
  const { isSidebarOpen } = useContext(SliderContext);
  const [chartData, setChartData] = useState([]);
  const dispatch = useDispatch();

  const { organizations } = useSelector((state) => state.organizationData);
  const { branches } = useSelector((state) => state.branchData);
  const { departments } = useSelector((state) => state.departmentData);

  useEffect(() => {
    dispatch(getAllDepartments());
    dispatch(getAllOrganizations());
    dispatch(getAllBranches());
  }, [dispatch, organizations.length, branches.length, departments.length]);

  useEffect(() => {
    const fetchData = () => {
      const data = [
        {
          name: dashboardStrings.dashboard.stats.users,
          value: 400,
          color: "#3B82F6",
        },
        {
          name: dashboardStrings.dashboard.stats.organizations,
          value: organizations.length,
          color: "#210F37",
        },
        {
          name: dashboardStrings.dashboard.stats.branches,
          value: branches.length,
          color: "#fc0380",
        },
        {
          name: dashboardStrings.dashboard.stats.departments,
          value: departments.length,
          color: "#10B981",
        },
        {
          name: dashboardStrings.dashboard.stats.assets,
          value: 2,
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
    };
    fetchData();
  }, [organizations, branches, departments]);

  return (
    <div
      className={`w-full bg-slate-100 p-6 ${
        isSidebarOpen
          ? "lg:fixed lg:h-screen lg:overflow-hidden  md:overflow-y-scroll overflow-y-scroll"
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

        <div
          className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl pt-4`}
        >
          {chartData.map((item) => (
            <div
              key={item.name}
              className="py-2 px-2 rounded-lg shadow-lg text-white"
              style={{ backgroundColor: item.color }}
            >
              <h2 className="text-3xl font-bold">{item.value}</h2>
              <h6 className="text-lg font-bold mt-2">{item.name}</h6>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-6 mt-6 rounded-xl shadow-2xl w-full">
          <h3 className="text-2xl font-semibold text-white mb-4">
            {dashboardStrings.dashboard.assetOverview}
          </h3>
          <div className={isSidebarOpen ? "h-[150px]" : "h-[200px]"}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

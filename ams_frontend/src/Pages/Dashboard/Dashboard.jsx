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

import { getAllDepartments } from "../../Features/slices/departmentSlice";
const Dashboard = () => {
  const { isSidebarOpen } = useContext(SliderContext);
  const [chartData, setChartData] = useState([]);
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.departmentData);

  useEffect(() => {
    dispatch(getAllDepartments());
  }, [dispatch, departments.length]);

  useEffect(() => {
    const fetchData = () => {
      const data = [
        { name: "Users", value: 4, color: "#3B82F6" },
        { name: "Departments", value: departments.length, color: "#10B981" },
        { name: "Assets", value: 2, color: "#FBBF24" },
        { name: "Assign Tags", value: 4, color: "#EF4444" },
        { name: "Out For Delivery", value: 4, color: "#14B8A6" },
      ];
      setChartData(data);
    };
    fetchData();
  }, [departments]);

  return (
    <div
      className={`w-full min-h-screen bg-slate-100 p-6  ${
        isSidebarOpen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
      }`}
    >
      <div
        className={`mx-auto min-h-screen ${
          isSidebarOpen
            ? "lg:w-[78%] md:ml-[260px] md:w-[65%]  "
            : "lg:w-[90%] md:ml-[100px] "
        }`}
      >
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 pt-20 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="py-9 px-2 rounded-lg shadow-lg text-white"
              style={{ backgroundColor: item.color }}
            >
              <h2 className="text-3xl font-bold">{item.value}</h2>
              <h6 className="text-lg font-bold mt-2">{item.name}</h6>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 mt-6 rounded-xl shadow-2xl w-full">
          <h3 className="text-2xl font-semibold text-white mb-4">
            🔹 Asset Overview
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="name" tick={{ fill: "#fff" }} />
              <YAxis tick={{ fill: "#fff" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
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
  );
};

export default Dashboard;

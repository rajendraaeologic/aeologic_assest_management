import React, { useContext, useState } from "react";
import imageOpen from "../../assets/AeoLogic.logo.png";
import imageClosed from "../../assets/Aeo.logo.png";
import { GiAudioCassette } from "react-icons/gi";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaTags,
  FaTruck,
  FaChartBar,
  FaCaretDown,
  FaBuilding,
  FaCodeBranch,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import SliderContext from "../ContexApi";

const Sidebar = () => {
  const { isSidebarOpen } = useContext(SliderContext);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleReportsToggle = (e) => {
    e.stopPropagation();
    setReportsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${
        isSidebarOpen
          ? "md:w-[240px] w-[200px]"
          : "lg:w-[80px] md:w-[80px] w-0 "
      } h-full bg-[#1a2942] text-white fixed top-0 left-0 transition-all duration-300 z-50`}
    >
      {/* Logo Section */}
      <div className="flex justify-center items-center py-4">
        <img
          src={isSidebarOpen ? imageOpen : imageClosed}
          alt="Sidebar Logo"
          className={`transition-all duration-300 ${
            isSidebarOpen ? "w-28" : "w-10"
          }`}
        />
      </div>
      <hr className="border-gray-400" />

      {/* Sidebar Menu */}
      <div
        className={`${
          isSidebarOpen
            ? "mt-4 h-[calc(100vh-100px)] px-2 overflow-y-auto overflow-x-hidden lg:overflow-y-hidden"
            : "mt-4 h-[calc(100vh-100px)] px-2"
        }`}
      >
        <ul className="space-y-1 text-slate-500">
          {[
            { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
            {
              name: "User Registration",
              icon: <FaUsers />,
              path: "/registration",
            },
            {
              name: "Organization",
              icon: <FaBuilding />,
              path: "/organization",
            },
            { name: "Branch", icon: <FaCodeBranch />, path: "/branch" },
            { name: "Department", icon: <FaBriefcase />, path: "/department" },
            { name: "Asset", icon: <GiAudioCassette />, path: "/asset" },
            { name: "Assign Tag", icon: <FaTags />, path: "/assigntag" },
            {
              name: "Out For Delivery",
              icon: <FaTruck />,
              path: "/outfordelivery",
            },
          ].map((item, index) => (
            <li
              key={index}
              className={`relative group ${
                !isSidebarOpen ? "hidden sm:block md:block" : ""
              }`}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md ${
                    isActive ? "text-cyan-500 bg-gray-800" : "hover:bg-gray-700"
                  }`
                }
              >
                {/* Icon */}
                <span
                  className={`w-6 h-6 flex justify-center items-center text-lg ${
                    isSidebarOpen ? "block" : "hidden md:flex"
                  }`}
                >
                  {item.icon}
                </span>

                {isSidebarOpen && <span className="ml-3">{item.name}</span>}

                {!isSidebarOpen && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white rounded-md text-sm min-w-[135px] text-center shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-2 transition-all duration-300 z-50 pointer-events-none">
                    {item.name}
                  </span>
                )}
              </NavLink>
            </li>
          ))}

          {/* Reports Dropdown */}
          <li
            className={`relative group ${
              !isSidebarOpen ? "hidden sm:block md:block" : ""
            }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer hover:text-cyan-500 p-2 rounded-md"
              onClick={handleReportsToggle}
            >
              <div className="flex items-center">
                {/* Reports Icon */}
                <span
                  className={`w-6 h-6 flex justify-center items-center text-lg ${
                    isSidebarOpen ? "block" : "hidden md:flex"
                  }`}
                >
                  <FaChartBar />
                </span>

                {/* Reports Name */}
                {isSidebarOpen && <span className="ml-3">Reports</span>}

                {!isSidebarOpen && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-gray-800 text-white rounded-md text-sm min-w-[120px] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-2 transition-all duration-300 z-50 pointer-events-none">
                    Reports
                  </span>
                )}
              </div>
              <FaCaretDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  reportsOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Reports Dropdown List */}
            {reportsOpen && (
              <ul
                className={` mt-2 ${
                  isSidebarOpen
                    ? "ml-10"
                    : "absolute left-full md:-mt-36 lg:-mt-8 bg-[#1a2942] w-[180px] p-2 rounded-md shadow-md z-50"
                }`}
              >
                {[
                  { name: "Date Wish Report", path: "/datewishreport" },
                  { name: "Date Range Report", path: "/daterangereport" },
                  { name: "Department Report", path: "/reportdepartment" },
                  { name: "Track Device Report", path: "/trackdevicereport" },
                ].map((report, index) => (
                  <li key={index}>
                    <NavLink
                      to={report.path}
                      className={({ isActive }) =>
                        `block p-2 rounded-md ${
                          isActive
                            ? "text-cyan-500 bg-gray-800"
                            : "hover:bg-gray-700"
                        }`
                      }
                    >
                      {report.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

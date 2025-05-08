import React, { useContext, useState, useEffect, useRef } from "react";
import imageOpen from "../../assets/AeoLogic.logo.png";
import imageClosed from "../../assets/Aeo.logo.png";
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
import { GiAudioCassette } from "react-icons/gi";
import { MdPersonAdd } from "react-icons/md";
import { NavLink } from "react-router-dom";
import SliderContext from "../ContexApi";
// import ReactTooltip from "react-tooltip";
import { Tooltip } from 'react-tooltip';

const Sidebar = () => {
  const { isSidebarOpen } = useContext(SliderContext);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const reportRef = useRef(null);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "User Registration", icon: <FaUsers />, path: "/registration" },
    { name: "Organization", icon: <FaBuilding />, path: "/organization" },
    { name: "Branch", icon: <FaCodeBranch />, path: "/branch" },
    { name: "Department", icon: <FaBriefcase />, path: "/department" },
    { name: "Add Asset", icon: <GiAudioCassette />, path: "/asset" },
    { name: "Assign Asset", icon: <MdPersonAdd />, path: "/assignAsset" },
    { name: "Assign Tag (Coming Soon)", icon: <FaTags />, path: "/assigntag" },
    {
      name: "Out For Delivery (Coming Soon)",
      icon: <FaTruck />,
      path: "/outfordelivery",
    },
  ];

  const reports = [
    { name: "Date Wish Report", path: "/datewishreport" },
    { name: "Date Range Report", path: "/daterangereport" },
    { name: "Department Report", path: "/reportdepartment" },
    { name: "Track Device Report", path: "/trackdevicereport" },
  ];

  const handleReportsToggle = (e) => {
    e.stopPropagation();
    setReportsOpen((prev) => !prev);
    const rect = reportRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownTop(rect.top + rect.height);
      setDropdownLeft(rect.left + rect.width + 8);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!reportRef.current?.contains(e.target)) {
        setReportsOpen(false);
      }
    };
    if (reportsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [reportsOpen]);

  return (
    <div
      className={`${
        isSidebarOpen ? "md:w-[240px] w-[200px]" : "md:w-[80px] sm:w-[80px] w-0"
      } h-full bg-[#1a2942] text-white fixed top-0 left-0 transition-all duration-300 z-50 overflow-x-hidden`}
    >
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

      <div className="mt-4 h-[calc(100vh-100px)] px-2 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1 text-slate-500">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md relative ${
                    isActive ? "text-cyan-500 bg-gray-800" : "hover:bg-gray-700"
                  }`
                }
                data-tip={!isSidebarOpen ? item.name : ""}
                data-for={`tooltip-${index}`}
              >
                <span className="w-6 h-6 flex justify-center items-center text-lg">
                  {item.icon}
                </span>

                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>

              {!isSidebarOpen && (
                <Tooltip
                    id={`tooltip-${index}`}
                  place="right"
                  effect="solid"
                  className="!bg-gray-900 !text-white !text-sm !rounded-md !px-2 !py-1"
                />
              )}
            </li>
          ))}

          {/* Reports Dropdown */}
          <li ref={reportRef}>
            <div
              className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-700"
              onClick={handleReportsToggle}
              data-tip={!isSidebarOpen ? "Reports (Coming Soon)" : ""}
              data-for="reports-tooltip"
            >
              <div className="flex items-center">
                <span className="w-6 h-6 flex justify-center items-center text-lg">
                  <FaChartBar />
                </span>
                {isSidebarOpen && (
                  <span className="ml-3">Reports (Coming Soon)</span>
                )}
              </div>
              <FaCaretDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  reportsOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {!isSidebarOpen && (
              <Tooltip
                  id="reports-tooltip"
                place="right"
                effect="solid"
                className="!bg-gray-900 !text-white !text-sm !rounded-md !px-2 !py-1"
              />
            )}

            {reportsOpen && isSidebarOpen && (
              <ul className="ml-10 mt-2">
                {reports.map((report, index) => (
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

            {reportsOpen && !isSidebarOpen && (
              <div
                className="fixed bg-[#1a2942] w-[180px] p-2  md:-mt-44 rounded-md shadow-xl z-[9999]"
                style={{ top: dropdownTop, left: dropdownLeft }}
              >
                {reports.map((report, index) => (
                  <NavLink
                    key={index}
                    to={report.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-md ${
                        isActive
                          ? "text-cyan-500 bg-gray-800"
                          : "hover:bg-gray-700 text-white"
                      }`
                    }
                  >
                    {report.name}
                  </NavLink>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useContext } from "react";
import imageOpen from "../../assets/AeoLogic.logo.png";
import imageClosed from "../../assets/Aeo.logo.png";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaTags,
  FaTruck,
  FaBuilding,
  FaCodeBranch,
} from "react-icons/fa";
import { GiAudioCassette } from "react-icons/gi";
import { MdPersonAdd } from "react-icons/md";
import { MdHistory } from "react-icons/md";
import { NavLink } from "react-router-dom";
import SliderContext from "../ContexApi";
import { Tooltip } from 'react-tooltip';
import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../Features/auth/authSlice.js";

const Sidebar = () => {
  const { isSidebarOpen } = useContext(SliderContext);

  const user = useSelector(selectCurrentUser);
  const userRole = user?.userRole;
  const sidebarRef = React.useRef(null);


  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "User Registration", icon: <FaUsers />, path: "/registration" },
    { name: "Organization", icon: <FaBuilding />, path: "/organization" },
    { name: "Branch", icon: <FaCodeBranch />, path: "/branch" },
    { name: "Department", icon: <FaBriefcase />, path: "/department" },
    { name: "Add Asset", icon: <GiAudioCassette />, path: "/asset" },
    { name: "Assign Asset", icon: <MdPersonAdd />, path: "/assignAsset" },
    { name: "Asset History", icon: <MdHistory />, path: "/assetHistory" },
    { name: "Assign Tag (Coming Soon)", icon: <FaTags />, path: "/assigntag" },
    {
      name: "Out For Delivery (Coming Soon)",
      icon: <FaTruck />,
      path: "/outfordelivery",
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (
        item.name === "Organization" &&
        (userRole === "ADMIN" || userRole === "MANAGER")
    ) {
      return false;
    }
    return true;
  });

  React.useEffect(() => {
    const handleWheel = (e) => {
      if (!sidebarRef.current) return;

      const isOverSidebar = sidebarRef.current.contains(e.target);
      if (isOverSidebar) {
        e.preventDefault();

        const sidebarContent = sidebarRef.current.querySelector('.sidebar-content');
        if (sidebarContent) {
          const { scrollTop, scrollHeight, clientHeight } = sidebarContent;
          const atTop = scrollTop === 0;
          const atBottom = scrollHeight - scrollTop === clientHeight;

          if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
            return;
          }
          sidebarContent.scrollTop += e.deltaY;
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div
        ref={sidebarRef}
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
          {filteredMenuItems.map((item, index) => (
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

        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

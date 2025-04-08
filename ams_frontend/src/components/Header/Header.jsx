import React, { useContext, useState } from "react";
import SliderContext from "../ContexApi";
import { FaBars } from "react-icons/fa";
import navImage from "../../assets/navImage.jpg";
import { TfiArrowCircleUp } from "react-icons/tfi";
import { BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectCurrentUser } from "../../Features/auth/authSlice";
import { persistor } from "../../Store/store";

const Header = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(SliderContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await dispatch(logoutUser(persistor)).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <div
      className={`flex w-full bg-white py-4 justify-between fixed top-0 items-center pr-7 z-20 transition-all duration-300 ${
        isSidebarOpen ? "md:pl-[260px] pl-[210px]" : "pl-[100px]"
      }`}
    >
      <div>
        <button onClick={toggleSidebar} className="text-xl">
          <FaBars />
        </button>
      </div>

      <div className="md:mr-10 sm:mr-8 flex justify-center items-center gap-3">
      <p className="pr-5 ">
          <ul>
            <li className="font-bold text-lg">{currentUser?.userName}</li>
            <li className="text-sm">{currentUser?.userRole}</li>
          </ul>
        </p>

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`text-2xl focus:outline-none transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <TfiArrowCircleUp />
        </button>

        <div
          className={`${
            isDropdownOpen
              ? "absolute right-2 mt-24 w-[150px] bg-white border border-gray-200 rounded-md shadow-lg"
              : "hidden"
          }`}
        >
          <ul className="py-1 ">
            <li>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <div className="flex justify-center items-center gap-3  ">
                  {" "}
                  <BiLogOut className="h-6 w-8" />
                  <span className="pr-8">Logout</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;

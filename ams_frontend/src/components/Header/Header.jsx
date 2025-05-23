import  { useContext, useState } from "react";
import SliderContext from "../ContexApi";
import { FaBars } from "react-icons/fa";
import {TfiArrowCircleDown, TfiArrowCircleUp} from "react-icons/tfi";
import { BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../Features/auth/authSlice";
import { persistor } from "../../Store/store";
import { selectCurrentUser } from "../../Features/auth/authSlice";

const Header = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(SliderContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const allowedRoles = ["ADMIN", "MANAGER", "SUPERADMIN"];
  const isAllowed = allowedRoles.includes(currentUser?.userRole);

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

  // Conditionally apply the classes based on user role
  const sidebarClass =
    currentUser?.userRole === "USER"
      ? ""
      : isSidebarOpen
      ? "md:pl-[260px] pl-[210px]"
      : "pl-[100px]";

  return (
    <div
      className={`flex w-full bg-white py-4 justify-between items-center fixed top-0 pr-7 z-20 transition-all duration-300 ${sidebarClass}`}
    >
      <div className="flex items-center ">
        {currentUser?.userRole === "USER" ? (
          <span className="text-xl font-bold pl-8">User Dashboard</span>
        ) : isAllowed ? (
          <button onClick={toggleSidebar} className="text-xl">
            <FaBars />
          </button>
        ) : null}
      </div>

      <div className="md:mr-10 sm:mr-8 flex justify-center items-center gap-3">
        <ul>
          <li className="font-bold text-lg">{currentUser?.userName}</li>
          <li className="text-sm">{currentUser?.userRole}</li>
        </ul>

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`text-2xl focus:outline-none transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <TfiArrowCircleDown />
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

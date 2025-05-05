// import React from "react";
// import Header from "./Header/Header";
// import Sidebar from "./Siderbar/Siderbar";
// import Footer from "./Footer/Footer";
// import { Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectCurrentUser } from "../Features/auth/authSlice";
// import { ADMIN_ROLES } from "../TypeRoles/constants.roles";

// const Layout = () => {
//   const user = useSelector(selectCurrentUser);
//   const isAdmin = ADMIN_ROLES.includes(user?.userRole);

//   return (
//     <div className="app-container">
//       <Header />
//       {isAdmin && <Sidebar />}
//       <main
//         className={`main-content ${isAdmin ? "admin-layout" : "user-layout"}`}
//       >
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default Layout;

import React from "react";
import Header from "./Header/Header";
import Sidebar from "./Siderbar/Siderbar";
import Footer from "./Footer/Footer";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../Features/auth/authSlice";
import { ADMIN_ROLES } from "../TypeRoles/constants.roles";

const Layout = () => {
  const user = useSelector(selectCurrentUser);
  const userRole = user?.userRole?.toUpperCase();

  // Inline normalization of ADMIN_ROLES
  const normalizedAdminRoles = ADMIN_ROLES.map((role) => role.toUpperCase());
  const isAdmin = normalizedAdminRoles.includes(userRole);

  return (
    <div className="app-container">
      <Header />

      {/* Sidebar only for Admins */}
      {isAdmin && <Sidebar />}

      <main
        className={`main-content ${isAdmin ? "admin-layout" : "user-layout"}`}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;

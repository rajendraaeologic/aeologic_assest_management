import React from "react";
import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Context Provider
import SliderContextProvider from "./components/ContextProvider";

// Pages
import Layout from "./components/Layout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import UserRegistration from "./Pages/UserRegistration/UserRegistration";
import Department from "./Pages/Department/Department";
import AssignTag from "./Pages/AssignTag/AssignTag";
import Asset from "./Pages/Asset/Asset";
import OutForDelivery from "./Pages/OutForDelivery/OutForDelivery";
import DateWishReport from "./Pages/Reports/DateWishReports";
import DateRangeReport from "./Pages/Reports/DateRangeReport";
import ReportDepartment from "./Pages/Reports/ReportDepartmentre";
import TrackDeviceReport from "./Pages/Reports/Track Device Report";
import Organization from "./Pages/Organization/Organization";
import Branch from "./Pages/Branch/Branch";
import AssignAsset from "./Pages/AssignAsset/AssignAsset";
import Login from "./Pages/LoginUser/LoginUser";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import UnauthorizedPage from "./Pages/Unauthorized/Unauthorized";
import AssetHistory from "./Pages/AssetHistory/AssetHistory";

// Auth
import RequireAuth from "./Features/auth/RequireAuth";
import { ADMIN_ROLES, USER_ROLES } from "./TypeRoles/constants.roles";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // Admin Routes
  {
    element: <RequireAuth allowedRoles={ADMIN_ROLES} />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "registration", element: <UserRegistration /> },
          { path: "organization", element: <Organization /> },
          { path: "branch", element: <Branch /> },
          { path: "department", element: <Department /> },
          { path: "asset", element: <Asset /> },
          { path: "assignAsset", element: <AssignAsset /> },
          { path: "assetHistory", element: <AssetHistory /> },
          { path: "assigntag", element: <AssignTag /> },
          { path: "outfordelivery", element: <OutForDelivery /> },
          { path: "datewishreport", element: <DateWishReport /> },
          { path: "daterangereport", element: <DateRangeReport /> },
          { path: "reportdepartment", element: <ReportDepartment /> },
          { path: "trackdevicereport", element: <TrackDeviceReport /> },
        ],
      },
    ],
  },

  // User Routes
  {
    element: <RequireAuth allowedRoles={[USER_ROLES.USER]} />,
    children: [
      {
        element: <Layout />,
        children: [{ path: "/user-dashboard", element: <UserDashboard /> }],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);

const App = () => {
  return (
    <>
      <ToastContainer />
      <SliderContextProvider>
        <RouterProvider router={router} />
      </SliderContextProvider>
    </>
  );
};

export default App;

import React from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import RequireAuth from "./Features/auth/RequireAuth";

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
import Login from "./Pages/LoginUser/LoginUser";
import { Navigate } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "registration", element: <UserRegistration /> },
          { path: "organization", element: <Organization /> },
          { path: "branch", element: <Branch /> },
          { path: "department", element: <Department /> },
          { path: "assigntag", element: <AssignTag /> },
          { path: "asset", element: <Asset /> },
          { path: "outfordelivery", element: <OutForDelivery /> },
          { path: "datewishreport", element: <DateWishReport /> },
          { path: "daterangereport", element: <DateRangeReport /> },
          { path: "reportdepartment", element: <ReportDepartment /> },
          { path: "trackdevicereport", element: <TrackDeviceReport /> },
        ],
      },
    ],
  },
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

import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectCurrentToken, selectCurrentUser } from "./authSlice";

const RequireAuth = ({ allowedRoles }) => {
  console.log("user", allowedRoles);

  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.userRole?.toUpperCase() || "";
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    return userRole === "USER" ? (
      <Navigate to="/user-dashboard" replace />
    ) : (
      <Navigate to="/unauthorized" replace />
    );
  }

  return <Outlet />;
};

export default RequireAuth;

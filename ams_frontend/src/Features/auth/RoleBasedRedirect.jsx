import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "./authSlice";
import { ADMIN_ROLES } from "../../TypeRoles/constants.roles";

const RoleBasedRedirect = () => {
  const user = useSelector(selectCurrentUser);
  const userRole = user?.userRole;

  if (!user) return <Navigate to="/login" replace />;

  if (ADMIN_ROLES.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/user-dashboard" replace />;
};

export default RoleBasedRedirect;

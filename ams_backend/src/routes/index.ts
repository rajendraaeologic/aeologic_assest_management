import express from "express";
import basicRoutes from "@/routes/basic.routes";
import authRoute from "@/routes/auth.routes";
import userRoute from "@/routes/user.routes";
import organizationRoutes from "@/routes/organization.routes";
import departmentRoutes from "@/routes/department.routes";
import branchRoutes from "@/routes/branch.routes";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/",
    route: basicRoutes,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/organization",
    route: organizationRoutes,
  },
  {
    path: "/department",
    route: departmentRoutes,
  },
  {
    path: "/branch",
    route: branchRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

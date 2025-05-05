import express from "express";
import basicRoutes from "@/routes/basic.routes";
import authRoute from "@/routes/auth.routes";
import userRoute from "@/routes/user.routes";
import organizationRoutes from "@/routes/organization.routes";
import departmentRoutes from "@/routes/department.routes";
import branchRoutes from "@/routes/branch.routes";
import assetRoutes from "@/routes/asset.routes";
import dashboardCountRoutes from "@/routes/dashboard.routes";
import userDashboardRoutes from "@/routes/userDashboard.routes";
import assignAssetRoutes from "@/routes/assignAsset.routes";

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
  {
    path: "/asset",
    route: assetRoutes,
  },
  {
    path: "/assignAsset",
    route: assignAssetRoutes,
  },

  {
    path: "/dashboard",
    route: dashboardCountRoutes,
  },
  {
    path: "/userDashboard",
    route: userDashboardRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

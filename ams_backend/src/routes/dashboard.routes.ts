import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import { dashboardController } from "@/controller";
import dashboardValidation from "@/validations/dashboard.validation";

const router = express.Router();

router.get(
  "/counts",
  auth("manageDashboard"),
  validate(dashboardValidation.getDashboardCountsValidation),
  dashboardController.getDashboardCounts
);

export default router;

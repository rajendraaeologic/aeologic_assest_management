import express from "express";

import validate from "@/middleware/validation.middleware";
import { dashboardController } from "@/controller";
import dashboardValidation from "@/validations/dashboard.validation";

const router = express.Router();

router.get(
  "/counts",
  validate(dashboardValidation.getDashboardCountsValidation),
  dashboardController.getDashboardCounts
);

export default router;

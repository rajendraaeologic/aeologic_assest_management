import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import { userDashboardValidations } from "@/validations";

import { userDashboardController } from "@/controller";

const router = express.Router();
router
  .route("/")
  .get(
    auth("getAssignAssetUser"),
    validate(userDashboardValidations.getUserAssignAssetValidation),
    userDashboardController.getAssignAssetUser
  );

export default router;

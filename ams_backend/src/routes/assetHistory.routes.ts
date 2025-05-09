import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import assetHistoryValidation from "@/validations/assetHistory.validation";
import assetHistoryController from "@/controller/assetHistory.controller";

const router = express.Router();

router.get(
    "/",
    auth(),
    validate(assetHistoryValidation.getAssetHistories),
    assetHistoryController.getAssetHistories
);

router.get(
    "/:historyId",
    auth(),
    validate(assetHistoryValidation.getAssetHistoryById),
    assetHistoryController.getAssetHistoryById
);

router.get(
    "/asset/:assetId",
    auth(),
    validate(assetHistoryValidation.getAssetHistoryByAssetId),
    assetHistoryController.getAssetHistoryByAssetId
);

export default router;
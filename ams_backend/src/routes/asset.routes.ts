import express from "express";
import validate from "@/middleware/validation.middleware";
import assetController from "@/controller/asset.controller";
import assetValidation from "@/validations/asset.validations";
import auth from "@/middleware/auth.middleware";
const router = express.Router();

router
  .route("/createAsset")
  .post(
    auth("manageAssets"),
    validate(assetValidation.createAssetValidation),
    assetController.createAsset
  );

router
  .route("/getAllAssets")
  .get(
    auth("manageAssets"),
    validate(assetValidation.getAllAssetsValidation),
    assetController.getAllAssets
  );

router
  .route("/:assetId")
  .get(
    auth("manageAssets"),
    validate(assetValidation.getAssetByIdValidation),
    assetController.getAssetById
  );

router
  .route("/:assetId")
  .put(
    auth("manageAssets"),
    validate(assetValidation.updateAssetValidation),
    assetController.updateAsset
  );

router
  .route("/:assetId")
  .delete(
    auth("manageAssets"),
    validate(assetValidation.deleteAssetValidation),
    assetController.deleteAsset
  );

router
  .route("/bulk-delete")
  .post(
    auth("manageAssets"),
    validate(assetValidation.bulkDeleteAssetsValidation),
    assetController.bulkDeleteAssets
  );

//   // Asset Assignment Routes
// router
//   .route("/:assetId/assign")
//   .put(validate(assetValidation.assignAssetValidation), assetController.assignAsset);

// router
//   .route("/:assetId/assignments")
//   .get(validate(assetValidation.getAssetAssignmentsValidation), assetController.getAssetAssignments);

// // Asset History Routes
// router
//   .route("/:assetId/history")
//   .get(validate(assetValidation.getAssetHistoryValidation), assetController.getAssetHistory);

export default router;

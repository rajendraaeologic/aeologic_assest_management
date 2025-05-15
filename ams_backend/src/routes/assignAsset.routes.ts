import express from "express";
import assignAssetValidation from "@/validations/assignAsset.validation";
import assignAssetController from "@/controller/assignAsset.controller";
import validate from "@/middleware/validation.middleware";
import auth from "@/middleware/auth.middleware";

const router = express.Router();

router
  .route("/asset-assignments")
  .post(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.assignAssetValidation),
    assignAssetController.assignAsset
  )
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getAssetAssignmentsValidation),
    assignAssetController.getAssetAssignments
  );

router
  .route("/available-assets")
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getAvailableAssetsValidation),
    assignAssetController.getAvailableAssets
  );

router
  .route("/assignable-users")
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getUsersForAssignmentValidation),
    assignAssetController.getUsersForAssignment
  );

// Get assignments for specific asset
router
  .route("/asset/:assetId")
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getAssetAssignmentsValidation),
    assignAssetController.getAssetAssignments
  );

// Get assignments for specific user
router
  .route("/user/:userId")
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getAssetAssignmentsValidation),
    assignAssetController.getAssetAssignments
  );

router.get(
  "/:departmentId/assets",
  auth("manageAssignAsset"),
  validate(assignAssetValidation.getAssetsByDepartmentIdValidation),
  assignAssetController.getAssetsByDepartmentId
);

router.get(
  "/:departmentId/users",
  auth("manageAssignAsset"),
  validate(assignAssetValidation.getUsersByDepartmentIdValidation),
  assignAssetController.getUsersByDepartmentId
);

router
  .route("/:assignmentId")
  .get(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.getAssetAssignmentByIdValidation),
    assignAssetController.getAssetAssignmentById
  )
  .delete(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.deleteAssignAssetValidation),
    assignAssetController.deleteAssignment
  )
  .put(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.updateAssetAssignmentValidation),
    assignAssetController.updateAssetAssignment
  );

router
  .route("/bulk-delete")
  .post(
    auth("manageAssignAsset"),
    validate(assignAssetValidation.bulkDeleteAssetsValidation),
    assignAssetController.bulkDeleteAssignments
  );

export default router;

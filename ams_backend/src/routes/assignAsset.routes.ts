    import express from "express";
    import assignAssetValidation, {getAssetsByDepartmentIdValidation} from "@/validations/assignAsset.validation";
    import assignAssetController from "@/controller/assignAsset.controller";
    import validate from "@/middleware/validation.middleware";

    const router = express.Router();

    router
        .route("/asset-assignments")
        .post(validate(assignAssetValidation.assignAssetValidation), assignAssetController.assignAsset)
        .get(validate(assignAssetValidation.getAssetAssignmentsValidation), assignAssetController.getAssetAssignments);

    router
        .route("/available-assets")
        .get(validate(assignAssetValidation.getAvailableAssetsValidation), assignAssetController.getAvailableAssets);

    router
        .route("/assignable-users")
        .get(validate(assignAssetValidation.getUsersForAssignmentValidation), assignAssetController.getUsersForAssignment);

    router
        .route("/:assignmentId")
        .get(validate(assignAssetValidation.getAssetAssignmentByIdValidation), assignAssetController.getAssetAssignmentById)
        .delete(validate(assignAssetValidation.unassignAssetValidation), assignAssetController.unassignAsset);


    // Get assignments for specific asset
    router
        .route("/asset/:assetId")
        .get(validate(assignAssetValidation.getAssetAssignmentsValidation), assignAssetController.getAssetAssignments);

    // Get assignments for specific user
    router
        .route("/user/:userId")
        .get(validate(assignAssetValidation.getAssetAssignmentsValidation), assignAssetController.getAssetAssignments);

    router.get(
        '/:departmentId/assets',
        validate(assignAssetValidation.getAssetsByDepartmentIdValidation),
        assignAssetController.getAssetsByDepartmentId
    );

    router.get(
        '/:departmentId/users',
        validate(assignAssetValidation.getUsersByDepartmentIdValidation),
        assignAssetController.getUsersByDepartmentId
    );

    export default router;
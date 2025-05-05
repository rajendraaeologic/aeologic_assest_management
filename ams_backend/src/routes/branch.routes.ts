import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import { branchController } from "@/controller";
import branchValidation from "@/validations/branch.validation";

const router = express.Router();

router
  .route("/createBranch")
  .post(
    auth("manageBranches"),
    validate(branchValidation.createBranchValidation),
    branchController.createBranch
  );
router;

router
  .route("/getAllBranches")
  .get(
    auth("manageBranches"),
    validate(branchValidation.getAllBranchesValidation),
    branchController.getAllBranches
  );
router
  .route("/:branchId")
  .get(
    auth("manageBranches"),
    validate(branchValidation.getBranchByIdValidation),
    branchController.getBranchById
  );

router
  .route("/:branchId")
  .put(
    auth("manageBranches"),
    validate(branchValidation.updateBranchValidation),
    branchController.updateBranch
  );

router
  .route("/:branchId")
  .delete(
    auth("manageBranches"),
    validate(branchValidation.deleteBranchValidation),
    branchController.deleteBranch
  );
router
  .route("/bulk-delete")
  .post(
    auth("manageBranches"),
    validate(branchValidation.deleteBranchesValidation),
    branchController.deleteBranches
  );

router.get(
  "/:organizationId/branches",
  auth("manageBranches"),
  validate(branchValidation.getBranchesByOrganizationIdValidation),
  branchController.getBranchesByOrganizationId
);

export default router;

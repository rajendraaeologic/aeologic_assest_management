import express from "express";

import validate from "@/middleware/validation.middleware";
import { branchController } from "@/controller";
import branchValidation from "@/validations/branch.validation";

const router = express.Router();

router
  .route("/createBranch")
  .post(
    validate(branchValidation.createBranchValidation),
    branchController.createBranch
  );
router
  .route("/getAllBranches")
  .get(
    validate(branchValidation.getAllBranchesValidation),
    branchController.getAllBranches
  );
router
  .route("/:branchId")
  .get(
    validate(branchValidation.getBranchByIdValidation),
    branchController.getBranchById
  );

router
  .route("/:branchId")
  .put(
    validate(branchValidation.updateBranchValidation),
    branchController.updateBranch
  );

router
  .route("/:branchId")
  .delete(
    validate(branchValidation.deleteBranchValidation),
    branchController.deleteBranch
  );
router
  .route("/bulk-delete")
  .post(
    validate(branchValidation.deleteBranchesValidation),
    branchController.deleteBranches
  );

router.get(
  "/:organizationId/branches",
  validate(branchValidation.getBranchesByOrganizationIdValidation),
  branchController.getBranchesByOrganizationId
);

export default router;

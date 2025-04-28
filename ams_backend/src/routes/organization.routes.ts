import express from "express";
import validate from "@/middleware/validation.middleware";
import organizationController from "@/controller/organization.controller";
import organizationValidation from "@/validations/organization.validation";

const router = express.Router();

router
  .route("/createOrganization")
  .post(
    validate(organizationValidation.createOrganizationValidation),
    organizationController.createOrganization
  );

router
  .route("/getAllOrganizations")
  .get(
    validate(organizationValidation.getAllOrganizationsValidation),
    organizationController.getAllOrganizations
  );
router
  .route("/:organizationId")
  .get(
    validate(organizationValidation.getOrganizationByIdValidation),
    organizationController.getOrganizationById
  );

router
  .route("/:organizationId")
  .put(
    validate(organizationValidation.updateOrganizationValidation),
    organizationController.updateOrganization
  );

router
  .route("/:organizationId")
  .delete(
    validate(organizationValidation.deleteOrganizationValidation),
    organizationController.deleteOrganization
  );

router
  .route("/bulk-delete")
  .post(
    validate(organizationValidation.bulkDeleteOrganizations),
    organizationController.bulkDeleteOrganizations
  );
export default router;

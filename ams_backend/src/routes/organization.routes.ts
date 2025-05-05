import express from "express";
import validate from "@/middleware/validation.middleware";
import organizationController from "@/controller/organization.controller";
import organizationValidation from "@/validations/organization.validation";
import auth from "@/middleware/auth.middleware";
import { UserRole } from "@prisma/client";
console.log("UserRole", UserRole);

const router = express.Router();

router
  .route("/createOrganization")
  .post(
    auth("manageOrganizations"),
    validate(organizationValidation.createOrganizationValidation),
    organizationController.createOrganization
  );

router
  .route("/getAllOrganizations")
  .get(
    auth("manageOrganizations"),
    validate(organizationValidation.getAllOrganizationsValidation),
    organizationController.getAllOrganizations
  );
router
  .route("/:organizationId")
  .get(
    auth("manageOrganizations"),
    validate(organizationValidation.getOrganizationByIdValidation),
    organizationController.getOrganizationById
  );

router
  .route("/:organizationId")
  .put(
    auth("manageOrganizations"),
    validate(organizationValidation.updateOrganizationValidation),
    organizationController.updateOrganization
  );

router
  .route("/:organizationId")
  .delete(
    auth("manageOrganizations"),
    validate(organizationValidation.deleteOrganizationValidation),
    organizationController.deleteOrganization
  );

router
  .route("/bulk-delete")
  .post(
    auth("manageOrganizations"),
    validate(organizationValidation.bulkDeleteOrganizations),
    organizationController.bulkDeleteOrganizations
  );
export default router;

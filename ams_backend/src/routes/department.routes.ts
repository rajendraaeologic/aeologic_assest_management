import express from "express";

import validate from "@/middleware/validation.middleware";
import departmentController from "@/controller/department.controller";
import departmentValidation from "@/validations/department.validation";

const router = express.Router();

router
  .route("/createDepartment")
  .post(
    validate(departmentValidation.createDepartmentValidation),
    departmentController.createDepartment
  );

router
  .route("/getAllDepartments")
  .get(
    validate(departmentValidation.getAllDepartmentsValidation),
    departmentController.getAllDepartments
  );

router
  .route("/:id")
  .get(
    validate(departmentValidation.getDepartmentValidation),
    departmentController.getDepartmentById
  );
router
  .route("/:departmentId")
  .put(
    validate(departmentValidation.updateDepartmentValidation),
    departmentController.updateDepartment
  );
router
  .route("/:departmentId")
  .delete(
    validate(departmentValidation.deleteDepartmentValidation),
    departmentController.deleteDepartment
  );

router
  .route("/bulk-delete")
  .post(
    validate(departmentValidation.bulkDeleteDepartmentsValidation),
    departmentController.deleteDepartments
  );

export default router;

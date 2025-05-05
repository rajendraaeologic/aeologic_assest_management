import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import departmentController from "@/controller/department.controller";
import departmentValidation from "@/validations/department.validation";

const router = express.Router();

router
  .route("/createDepartment")
  .post(
    auth("manageDepartments"),
    validate(departmentValidation.createDepartmentValidation),
    departmentController.createDepartment
  );

router
  .route("/getAllDepartments")
  .get(
    auth("manageDepartments"),
    validate(departmentValidation.getAllDepartmentsValidation),
    departmentController.getAllDepartments
  );

router
  .route("/:id")
  .get(
    auth("manageDepartments"),
    validate(departmentValidation.getDepartmentValidation),
    departmentController.getDepartmentById
  );
router
  .route("/:departmentId")
  .put(
    auth("manageDepartments"),
    validate(departmentValidation.updateDepartmentValidation),
    departmentController.updateDepartment
  );
router
  .route("/:departmentId")
  .delete(
    auth("manageDepartments"),
    validate(departmentValidation.deleteDepartmentValidation),
    departmentController.deleteDepartment
  );

router
  .route("/bulk-delete")
  .post(
    auth("manageDepartments"),
    validate(departmentValidation.bulkDeleteDepartmentsValidation),
    departmentController.deleteDepartments
  );

router.get(
  "/:branchId/departments",
  auth("manageDepartments"),
  validate(departmentValidation.getDepartmentsByBranchIdValidation),
  departmentController.getDepartmentsByBranchId
);

export default router;

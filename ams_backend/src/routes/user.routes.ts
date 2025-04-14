import express from 'express';
import auth from '@/middleware/auth.middleware';
import validate from '@/middleware/validation.middleware';
import { userValidation} from '@/validations';
import {branchController, userController} from '@/controller';
import branchValidation from "@/validations/branch.validation";
import departmentValidation from "@/validations/department.validation";
import departmentController from "@/controller/department.controller";

const router = express.Router();

// router
//     .route('/')
//     .post(validate(userValidation.createUsers), userController.createUser)
//     .get(validate(userValidation.getUsers), userController.getUsers);

/*router
    .route('/notification')
    .get(auth(), validate(userValidation.getUserNotifications), userController.getUserNotifications)
    .post(auth(), validate(userValidation.markUserNotificationAsRead), userController.markUserNotificationAsRead)

router
    .route('/payments')
    .get(auth('getPayments'), validate(userValidation.getPayments), userController.getPayments)*/

// router
//     .route('/:userId')
//     .get(validate(userValidation.getUser), userController.getUser)
//     .patch(validate(userValidation.updateUser), userController.updateUser)
//     .delete(validate(userValidation.deleteUser), userController.deleteUser);
router
    .route("/createUser")
    .post(
        validate(userValidation.createUserValidation),
        userController.createUser
    );

router
    .route("/getAllUsers")
    .get(
        validate(userValidation.getAllUserValidation),
        userController.getAllUsers
    );
router
    .route("/:userId")
    .get(
        validate(userValidation.getUserValidation),
        userController.getUserById
    );

router
    .route("/:userId")
    .patch(
        validate(userValidation.updateUserValidation),
        userController.updateUser
    );

router
    .route("/:userId")
    .delete(
        validate(userValidation.deleteUserValidation),
        userController.deleteUser
    );

router.get(
    "/:organizationId/branches",
    validate(userValidation.getBranchesByOrganizationIdValidation),
    userController.getBranchesByOrganizationId
);

router.get(
    "/:branchId/departments",
    validate(userValidation.getDepartmentsByBranchIdValidation),
    userController.getDepartmentsByBranchId
);

export default router;
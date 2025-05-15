import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import { userValidation } from "@/validations";
import { userController } from "@/controller";
import { upload } from "@/middleware/upload";

const router = express.Router();

router
  .get(
    "/download-excel-template",
    auth("manageUsers"),
    userController.downloadUserExcelTemplate
  )
  .route("/")
  .post(
    auth("manageUsers"),
    validate(userValidation.createUsers),
    userController.createUser
  )

  .get(
    auth("manageUsers"),
    validate(userValidation.getUsers),
    userController.getUsers
  );
router.post(
  "/upload-excel",
  upload.single("file"),
  auth("manageUsers"),
  validate(userValidation.uploadUsers),
  userController.uploadUsersFromExcel
);

/*router
    .route('/notification')
    .get(auth(), validate(userValidation.getUserNotifications), userController.getUserNotifications)
    .post(auth(), validate(userValidation.markUserNotificationAsRead), userController.markUserNotificationAsRead)

router
    .route('/payments')
    .get(auth('getPayments'), validate(userValidation.getPayments), userController.getPayments)*/

router
  .route("/:userId")
  .get(
    auth("manageUsers"),
    validate(userValidation.getUser),
    userController.getUser
  )
  .put(
    auth("manageUsers"),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    auth("manageUsers"),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );
router
  .route("/bulk-delete")
  .post(
    auth("manageUsers"),
    validate(userValidation.deleteUsersValidation),
    userController.deleteUsers
  );

export default router;

import express from "express";
import auth from "@/middleware/auth.middleware";
import validate from "@/middleware/validation.middleware";
import { userValidation } from "@/validations";
import { userController } from "@/controller";
import { upload } from "@/middleware/upload";

const router = express.Router();

router;
router
  .get("/download-excel-template", userController.downloadUserExcelTemplate)
  .route("/")
  .post(validate(userValidation.createUsers), userController.createUser)

  .get(validate(userValidation.getUsers), userController.getUsers);
router.post(
  "/upload-excel",
  upload.single("file"),
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
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);
router
  .route("/bulk-delete")
  .post(
    validate(userValidation.deleteUsersValidation),
    userController.deleteUsers
  );

export default router;

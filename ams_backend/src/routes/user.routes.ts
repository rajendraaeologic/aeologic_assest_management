import express from 'express';
import auth from '@/middleware/auth.middleware';
import validate from '@/middleware/validation.middleware';
import { userValidation} from '@/validations';
import { userController} from '@/controller';

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(userValidation.createUsers), userController.createUser)
    .get(auth(), validate(userValidation.getUsers), userController.getUsers);

/*router
    .route('/notification')
    .get(auth(), validate(userValidation.getUserNotifications), userController.getUserNotifications)
    .post(auth(), validate(userValidation.markUserNotificationAsRead), userController.markUserNotificationAsRead)

router
    .route('/payments')
    .get(auth('getPayments'), validate(userValidation.getPayments), userController.getPayments)*/

router
    .route('/:userId')
    .get(auth(), validate(userValidation.getUser), userController.getUser)
    .patch(auth(), validate(userValidation.updateUser), userController.updateUser)
    .delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);

export default router;
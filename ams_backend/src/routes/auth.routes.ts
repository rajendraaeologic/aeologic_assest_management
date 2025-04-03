import express from 'express';
import validate from '@/middleware/validation.middleware';
import { authValidation } from '@/validations';
import { authController } from '@/controller';
import auth from "@/middleware/auth.middleware";

const router = express.Router();

router.post('/send-otp', validate(authValidation.sendOTP), authController.sendOTP);
router.post('/verify-otp', validate(authValidation.verifyOTP), authController.verifyOTP);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens',validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

export default router;
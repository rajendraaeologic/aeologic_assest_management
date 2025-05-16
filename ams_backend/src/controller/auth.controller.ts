import httpStatus from "http-status";
import catchAsync from "@/lib/catchAsync";
import appConfig from "@/config/app";
import {
  authService,
  userService,
  tokenService,
  emailService,
  bulkSmsService,
} from "@/services";
import { User } from "@prisma/client";
import ApiError from "@/lib/ApiError";
import { generateCode } from "@/lib/generateCode";
import { encryptPassword } from "@/lib/encryption";
import { LoginUserKeys } from "@/utils/selects.utils";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         tokens:
 *           $ref: '#/components/schemas/AuthTokens'
 *     AuthTokens:
 *       type: object
 *       properties:
 *         access:
 *           $ref: '#/components/schemas/Token'
 *         refresh:
 *           $ref: '#/components/schemas/Token'
 *     Token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         expires:
 *           type: string
 *           format: date-time
 *           example: 2023-05-15T12:00:00Z
 *     PhoneOTP:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         phone:
 *           type: string
 *         otp:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     OTPVerificationResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         isNewUser:
 *           type: boolean
 *         tokens:
 *           $ref: '#/components/schemas/AuthTokens'
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       "401":
 *         description: Invalid email or password
 *       "400":
 *         description: Validation error
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Unauthorized
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send({ message: "Logout Successfully" });
});

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Unauthorized
 *       "400":
 *         description: Invalid refresh token
 */
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Send reset password email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         description: Email not found
 *       "400":
 *         description: Validation error
 */
const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
      req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res
      .status(httpStatus.NO_CONTENT)
      .send({ message: `Password reset email sent successfully` });
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: newPassword123
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         description: Password reset failed
 *       "401":
 *         description: Invalid or expired token
 */
const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token as string, req.body.password);
  res
      .status(httpStatus.NO_CONTENT)
      .send({ message: `Password reset done successfully` });
});

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: Send email verification to authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         description: Bad request (email already verified or no email)
 *       "401":
 *         description: Unauthorized
 */
const sendVerificationEmail = catchAsync(async (req, res) => {
  const user = req.user as User;
  if (!user.email) {
    throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Please add your Email at your profile first"
    );
  }
  if (user.isEmailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
  }
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email!, verifyEmailToken);
  res
      .status(httpStatus.NO_CONTENT)
      .send({ message: `Verification email sent` });
});

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verify email token
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         description: Email verification failed
 *       "401":
 *         description: Invalid or expired token
 */
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token as string);
  res
      .status(httpStatus.NO_CONTENT)
      .send({ message: `Email Verification done successfully` });
});

export default {
  login,
  //sendOTP,
  //verifyOTP,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
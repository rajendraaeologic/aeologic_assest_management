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
 *     AuthResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Login successful"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               $ref: '#/components/schemas/Tokens'
 *     Tokens:
 *       type: object
 *       properties:
 *         access:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             expires:
 *               type: string
 *               format: date-time
 *         refresh:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             expires:
 *               type: string
 *               format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 401
 *         message:
 *           type: string
 *           example: "Incorrect email or password"
 *         isOperational:
 *           type: boolean
 *           example: true
 *         stack:
 *           type: string
 *           nullable: true
 *         errorType:
 *           type: string
 *           example: "Unauthorized"
 *     ForgotPasswordResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Password reset email sent successfully"
 *     VerifyEmailResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Verification email sent"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       "200":
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    res.status(200).send({
      statusCode: 200,
      message: "Login successful",
      data: {
        user,
        tokens
      }
    });
  } catch (error) {
    throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Incorrect email or password",
        true,
        null,
        "Unauthorized"
    );
  }
});


/*const sendOTP = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const otp = generateCode();
  let ISDCode = req.body.ISDCode || "971";

  const phoneOTP = await authService.upsertPhoneOTP(ISDCode, phone, otp);
  if (appConfig.sms.enabled) {
    await bulkSmsService.sendSms({
      to: `+${ISDCode}${phone}`,
      message: appConfig.sms.otpTemplate.replace("{{otp}}", otp),
    });
  }
  res.send(phoneOTP);
});*/

/*const verifyOTP = catchAsync(async (req, res) => {
  const { phone, otp } = req.body;
  const phoneOTP = await authService.verifyOtp(phone, otp);
  if (!phoneOTP) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP is invalid or expired.");
  }

  let user = await userService.getUserByPhone(phone, null, LoginUserKeys);
  let isNewUser = false;
  if (!user) {
    isNewUser = true;
    user = await userService.registerUser(
      {
        phone,
        password: await encryptPassword(`${phone}@shiksha`),
      } as User,
      LoginUserKeys
    );
  }

  const tokens = await tokenService.generateAuthTokens(user);
  res
    .status(httpStatus.CREATED)
    .send({ user, isNewUser, tokens, message: "OTP verified successfully." });
});*/
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
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
 *     responses:
 *       "204":
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout Successfully"
 */

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send({ message: "Logout Successfully" });
});
/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh authentication tokens
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
 *     responses:
 *       "200":
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 */

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
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
 *                 example: "user@example.com"
 *     responses:
 *       "204":
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordResponse'
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
 *                 example: "newPassword123"
 *     responses:
 *       "204":
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset done successfully"
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
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyEmailResponse'
 *       "400":
 *         description: Bad request (email already verified or no email)
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
 *     responses:
 *       "204":
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email Verification done successfully"
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

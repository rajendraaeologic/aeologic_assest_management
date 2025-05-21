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

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send({ message: "Logout Successfully" });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: `Password reset email sent successfully` });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token as string, req.body.password);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: `Password reset done successfully` });
});

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

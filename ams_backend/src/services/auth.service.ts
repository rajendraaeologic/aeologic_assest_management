import httpStatus from "http-status";
import tokenService from "./token.service";
import ApiError from "@/lib/ApiError";
import db from "@/lib/db";
import { AuthTokensResponse } from "@/types/response.type";
import { userService } from "@/services";
import { encryptPassword, isPasswordMatch } from "@/lib/encryption";
import exclude from "@/lib/exclude";
import {TokenType, User} from "@prisma/client";

const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<Omit<User, "password">> => {
  const user = await userService.getUserWithPasswordByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your Account doesn't exist");
  }

  if (user.deleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User account has been deleted");
  }

  if (!(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  return exclude(user, ["password"]);
};


const logout = async (refreshToken: string): Promise<void> => {
  try {
    const refreshTokenData = await db.token.findFirst({
      where: {
        token: refreshToken,
        type: TokenType.REFRESH,
      },
    });

    if (refreshTokenData) {
      await db.token.delete({ where: { id: refreshTokenData.id } });
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Logout failed');
  }
};

const refreshAuth = async (
    refreshToken: string
): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(
        refreshToken,
        TokenType.REFRESH
    );

    const user = await userService.getUserById(refreshTokenData.userId);
    if (!user || user.deleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User account has been deleted');
    }

    await db.token.delete({ where: { id: refreshTokenData.id } });

    return tokenService.generateAuthTokens({ id: user.id });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/*const verifyOtp = async (
  phone: string,
  otp: string
): Promise<Pick<PhoneOtp, "phone" | "otp"> | null> => {
  try {
    return db.phoneOtp.findFirst({
      where: { phone, otp },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Verify OTP failed");
  }
};*/

/*const upsertPhoneOTP = async (
  ISDCode: string,
  phone: string,
  otp: string
): Promise<Pick<PhoneOtp, "phone" | "otp"> | null> => {
  try {
    return db.phoneOtp.upsert({
      where: { phone },
      select: {
        phone: true,
        otp: true,
      },
      update: { ISDCode, phone, otp },
      create: { ISDCode, phone, otp },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Send OTP failed");
  }
};*/

const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  try {
    const resetPasswordTokenData = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenData.userId);
    if (!user) {
      throw new Error("User not found!");
    }
    const encryptedPassword = await encryptPassword(newPassword);
    await userService.updateUserById(user.id, { password: encryptedPassword });
    await db.token.deleteMany({
      where: { userId: user.id, type: TokenType.RESET_PASSWORD },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
  try {
    const verifyEmailTokenData = await tokenService.verifyToken(
        verifyEmailToken,
        TokenType.VERIFY_EMAIL
    );

    const user = await userService.getUserById(verifyEmailTokenData.userId);
    if (!user || user.deleted) {
      throw new Error("User account has been deleted");
    }

    await db.token.deleteMany({
      where: {
        userId: verifyEmailTokenData.userId,
        type: TokenType.VERIFY_EMAIL,
      },
    });
    await userService.updateUserById(verifyEmailTokenData.userId, {
      isEmailVerified: true,
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  //verifyOtp,
  //upsertPhoneOTP,
};

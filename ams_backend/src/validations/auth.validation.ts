import Joi from 'joi';
import {
    isValidMongoDBObjectId, isValidMongoDBObjectIdCustomMessages,
    password,
    passwordCustomMessages,
} from '@/validations/custom.validation';
import {UserRole} from "@prisma/client";

const register = {
    body: Joi.object().keys({
        countryCode: Joi.string().required().min(3),
        phone: Joi.string().required().min(7),
        password: Joi.string().required().custom(password).messages(passwordCustomMessages),
        email: Joi.string().optional().email(),
        name: Joi.string().optional().min(2),
        userRole: Joi.string().optional().valid(UserRole.USER, UserRole.ADMIN, UserRole.MANAGER),
        countryId: Joi.required().custom(isValidMongoDBObjectId).messages(isValidMongoDBObjectIdCustomMessages),
    })
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required().custom(password).messages(passwordCustomMessages),
    })
};


const sendOTP = {
    body: Joi.object().keys({
        ISDCode: Joi.string().default('971'),
        phone: Joi.string().required().min(7),
    })
};

const verifyOTP = {
    body: Joi.object().keys({
        phone: Joi.string().required().min(7),
        otp: Joi.string().required().min(4).max(4),
    })
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    })
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    })
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    })
};

const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required().custom(password).messages(passwordCustomMessages),
    })
};

const verifyEmail = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    })
};


export default {
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    verifyEmail
};

import { UserRole, UserStatus } from "@prisma/client";
import Joi from "joi";
import {
    isValidMongoDBObjectId,
    isValidMongoDBObjectIdCustomMessages,
    password,
    passwordCustomMessages,
} from "@/validations/custom.validation";

const getAllUserValidation = {
    query: Joi.object().keys({
        userName: Joi.string().optional(),
        userId: Joi.string()
            .optional()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
        status: Joi.string()
            .optional()
            .valid(UserStatus.ACTIVE, UserStatus.IN_ACTIVE),
        userRole: Joi.string()
            .optional()
            .valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
        from_date: Joi.string().optional().isoDate(),
        to_date: Joi.string().optional().isoDate(),
        sortBy: Joi.string(),
        sortType: Joi.string().valid("asc", "desc").default("desc"),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getUserValidation = {
    params: Joi.object().keys({
        userId: Joi.required()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
    }),
};

const createUserValidation = {
    body: Joi.object()
        .keys({
            userName: Joi.string().required(),
            phone: Joi.string().required().min(7),
            password: Joi.string()
                .required()
                .custom(password)
                .messages(passwordCustomMessages),
            email: Joi.string().email().required(),
            countryId: Joi.string().optional(),
            userRole: Joi.string()
                .required()
                .valid(
                    UserRole.SUPERADMIN,
                    UserRole.ADMIN,
                    UserRole.MANAGER,
                    UserRole.USER
                ),
            status: Joi.string()
                .required()
                .valid(UserStatus.ACTIVE, UserStatus.IN_ACTIVE),

            code: Joi.string().optional(),
            department: Joi.string().optional(),
            departmentCode: Joi.string().optional(),
            branchId: Joi.string()
                .optional()
                .custom(isValidMongoDBObjectId)
                .messages(isValidMongoDBObjectIdCustomMessages),
        })
        .min(1),
};

const updateUserValidation = {
    params: Joi.object().keys({
        userId: Joi.required()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().optional(),
            phone: Joi.string().required().min(7),
            email: Joi.string().email().optional(),
            userRole: Joi.string()
                .optional()
                .valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
            countryId: Joi.optional()
                .custom(isValidMongoDBObjectId)
                .messages(isValidMongoDBObjectIdCustomMessages),
        })
        .min(1),
};

const deleteUserValidation = {
    params: Joi.object().keys({
        userId: Joi.required()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
    }),
};

const getBranchesByOrganizationIdValidation = {
    params: Joi.object().keys({
        organizationId: Joi.required()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
    }),
};

const getDepartmentsByBranchIdValidation = {
    params: Joi.object().keys({
        branchId: Joi.required()
            .custom(isValidMongoDBObjectId)
            .messages(isValidMongoDBObjectIdCustomMessages),
    }),
};

export default {
    createUserValidation,
    getAllUserValidation,
    getUserValidation,
    updateUserValidation,
    deleteUserValidation,
    getBranchesByOrganizationIdValidation,
    getDepartmentsByBranchIdValidation,
};


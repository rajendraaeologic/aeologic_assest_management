import { UserRole, UserStatus } from "@prisma/client";
import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const getUsers = {
  query: Joi.object().keys({
    userName: Joi.string().optional(),
    email: Joi.string().optional().email().trim(),
    phone: Joi.string().optional().trim(),
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
    organizationName: Joi.string().optional(),
    branchName: Joi.string().optional().trim(),
    departmentName: Joi.string().optional().trim(),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),
    sortBy: Joi.string()
      .valid("userName", "email", "status", "userRole", "createdAt")
      .optional(),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    searchTerm: Joi.string().allow("").optional(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const createUsers = {
  body: Joi.object()
    .keys({
      userName: Joi.string().min(3).max(25).required(),
      phone: Joi.string().required().min(7).max(10),
      email: Joi.string().email().required(),

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
      companyId: Joi.string().length(24).hex().required(),
      branchId: Joi.string().length(24).hex().optional(),
      departmentId: Joi.string().length(24).hex().optional(),
    })
    .min(1),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object()
    .keys({
      userName: Joi.string().optional(),
      phone: Joi.string().required().min(7),
      email: Joi.string().email().optional(),
      userRole: Joi.string()
        .optional()
        .valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
      // countryId: Joi.optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      status: Joi.string()
        .required()
        .valid(UserStatus.ACTIVE, UserStatus.IN_ACTIVE),
      companyId: Joi.string().length(24).hex().optional(),
      branchId: Joi.string().length(24).hex().optional(),
      departmentId: Joi.string().length(24).hex().optional(),
    })

    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const deleteUsersValidation = {
  body: Joi.object().keys({
    userIds: Joi.array()
      .items(
        Joi.required()
          .custom(isValidMongoDBObjectId)
          .messages(isValidMongoDBObjectIdCustomMessages)
      )
      .min(1)
      .required()
      .unique()
      .messages({
        "array.min": "At least one user ID is required",
        "any.required": "User IDs are required",
        "array.unique": "User IDs must be unique",
      }),
  }),
};

//upload users

export const uploadUsers = {
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string()
      .valid(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv"
      )
      .required(),
    buffer: Joi.binary().required(),
    size: Joi.number()
      .max(5 * 1024 * 1024)
      .required(),
  }).unknown(true),
};

const excelUserSchema = Joi.object({
  userName: Joi.string().min(3).max(25).required().messages({
    "any.required": "Username is required",
    "string.min": "Username must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be 10-15 digits",
    }),
  userRole: Joi.string()
    .valid("ADMIN", "STUDENT", "MANAGER")
    .required()
    .messages({
      "any.required": "User role is required",
      "any.only": "Invalid user role",
    }),
  status: Joi.string().valid("ACTIVE", "INACTIVE").required().messages({
    "any.required": "Status is required",
    "any.only": "Invalid status",
  }),
  companyId: Joi.string().length(24).hex().required().messages({
    "any.required": "Company ID is required",
    "string.length": "Company ID must be 24 characters",
    "string.hex": "Company ID must be a valid hexadecimal",
  }),
  branchId: Joi.string().length(24).hex().required().messages({
    "any.required": "Branch ID is required",
    "string.length": "Branch ID must be 24 characters",
    "string.hex": "Branch ID must be a valid hexadecimal",
  }),
  departmentId: Joi.string().length(24).hex().required().messages({
    "any.required": "Department ID is required",
    "string.length": "Department ID must be 24 characters",
    "string.hex": "Department ID must be a valid hexadecimal",
  }),
}).unknown(true);

export const validateExcelUser = (user: any) => {
  const { error } = excelUserSchema.validate(user, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message).join("; ");
    throw new Error(messages);
  }
};
export default {
  createUsers,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteUsersValidation,
  uploadUsers,
  excelUserSchema,
  validateExcelUser,
};

import { UserRole, UserStatus } from "@prisma/client";
import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
  password,
  passwordCustomMessages,
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
      userName: Joi.string().required(),
      phone: Joi.string().required().min(7),
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
        .custom(password)
        .messages(passwordCustomMessages),
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
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      )
      .required(),
    buffer: Joi.binary().required(),
    size: Joi.number()
      .max(5 * 1024 * 1024)
      .required(),
  }).unknown(true),
};

const excelUserSchema = Joi.object({
  userName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  password: Joi.string().min(6).required(),
  userRole: Joi.string().valid("ADMIN", "STUDENT", "MANAGER").required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
  branchId: Joi.string().required(),
  departmentId: Joi.string().required(),
});

const validateExcelUser = (user: any) => {
  const { error } = excelUserSchema.validate(user);
  if (error) {
    throw new Error(error.details[0].message);
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

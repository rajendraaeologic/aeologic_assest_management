import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createDepartmentValidation = {
  body: Joi.object()
    .keys({
      departmentName: Joi.string().min(3).max(25).required(),
      //location: Joi.string().required(),
      branchId: Joi.string().required(),
    })
    .min(1),
};

const getAllDepartmentsValidation = {
  query: Joi.object().keys({
    departmentName: Joi.string().optional(),
    location: Joi.string().optional(),
    branchId: Joi.string().optional(),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),
    sortBy: Joi.string().optional(),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
    searchTerm: Joi.string().trim().optional(),
  }),
};

const getDepartmentValidation = {
  params: Joi.object().keys({
    id: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const updateDepartmentValidation = {
  params: Joi.object().keys({
    departmentId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object()
    .keys({
      departmentName: Joi.string().min(3).max(25).optional(),
    })
    .min(1),
};

const deleteDepartmentValidation = {
  params: Joi.object().keys({
    departmentId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const bulkDeleteDepartmentsValidation = {
  body: Joi.object().keys({
    departmentIds: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        "array.base": '"departmentIds" must be an array',
        "array.min": "At least one department ID is required",
        "string.pattern.base": "Each ID must be a valid MongoDB ID",
      }),
  }),
};

export const getDepartmentsByBranchIdValidation = {
  params: Joi.object().keys({
    branchId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),

  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    sortBy: Joi.string().optional(),
    sortType: Joi.string().valid("asc", "desc").optional(),
    status: Joi.string().optional(),
    createdAtFrom: Joi.date().iso().optional(),
    createdAtTo: Joi.date().iso().optional(),
    searchTerm: Joi.string().optional(),
  }),
};
export default {
  createDepartmentValidation,
  getAllDepartmentsValidation,
  getDepartmentValidation,
  updateDepartmentValidation,
  deleteDepartmentValidation,
  bulkDeleteDepartmentsValidation,
  getDepartmentsByBranchIdValidation,
};

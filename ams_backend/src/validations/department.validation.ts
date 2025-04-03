import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createDepartmentValidation = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      location: Joi.string().required(),
      branchId: Joi.string().required(),
    })
    .min(1),
};

const getAllDepartmentsValidation = {
  query: Joi.object().keys({
    name: Joi.string().optional(),
    location: Joi.string().optional(),
    branchId: Joi.string().optional(),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),
    sortBy: Joi.string(),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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
      name: Joi.string().optional(),
      location: Joi.string().optional(),
      branchId: Joi.optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
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

const bulkDeleteDpartmentsValidation = {
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
export default {
  createDepartmentValidation,
  getAllDepartmentsValidation,
  getDepartmentValidation,
  updateDepartmentValidation,
  deleteDepartmentValidation,
  bulkDeleteDpartmentsValidation,
};

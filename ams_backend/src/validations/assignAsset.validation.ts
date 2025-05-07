import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const assignAssetValidation = {
  body: Joi.object().keys({
    assetId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    userId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    companyId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    branchId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    departmentId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const unassignAssetValidation = {
  params: Joi.object().keys({
    assignmentId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const getAssetAssignmentsValidation = {
  query: Joi.object().keys({
    assetId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    userId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    status: Joi.string()
      .valid("ACTIVE", "IN_USE", "UNDER_MAINTENANCE", "RETIRED")
      .optional(),
    from_date: Joi.date().iso().optional(),
    to_date: Joi.date()
      .iso()
      .optional()
      .custom((value, helpers) => {
        if (
          helpers.state.ancestors[0].from_date &&
          value < helpers.state.ancestors[0].from_date
        ) {
          return helpers.error("date.to_date.lessThanFromDate");
        }
        return value;
      })
      .messages({
        "date.to_date.lessThanFromDate":
          '"to_date" must be greater than "from_date"',
      }),
    sortBy: Joi.string().valid("assignedAt", "status").optional(),
    sortType: Joi.string().valid("asc", "desc").optional(),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
  }),
};

const getAvailableAssetsValidation = {
  query: Joi.object().keys({
    branchId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    departmentId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const getUsersForAssignmentValidation = {
  query: Joi.object().keys({
    branchId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    departmentId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const getAssetAssignmentByIdValidation = {
  params: Joi.object().keys({
    assignmentId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

export const getAssetsByDepartmentIdValidation = {
  params: Joi.object().keys({
    departmentId: Joi.string()
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

export const getUsersByDepartmentIdValidation = {
  params: Joi.object().keys({
    departmentId: Joi.string()
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

const updateAssetAssignmentValidation = {
  params: Joi.object().keys({
    assignmentId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object().keys({
    assetId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    userId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    departmentId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const deleteAssignAssetValidation = {
  params: Joi.object().keys({
    assignmentId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const bulkDeleteAssetsValidation = {
  body: Joi.object().keys({
    assignmentIds: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        "array.base": '"assetIds" must be an array',
        "array.min": "At least one asset ID is required",
        "string.pattern.base": "Each ID must be a valid MongoDB ID",
      }),
  }),
};

export default {
  assignAssetValidation,
  unassignAssetValidation,
  getAssetAssignmentsValidation,
  getAvailableAssetsValidation,
  getUsersForAssignmentValidation,
  getAssetAssignmentByIdValidation,
  getAssetsByDepartmentIdValidation,
  getUsersByDepartmentIdValidation,
  updateAssetAssignmentValidation,
  deleteAssignAssetValidation,
  bulkDeleteAssetsValidation,
};

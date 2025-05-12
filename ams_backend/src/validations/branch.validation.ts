import Joi from "joi";

import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createBranchValidation = {
  body: Joi.object()
    .keys({
      branchName: Joi.string().min(3).max(25).required().messages({
        "string.empty": "Branch name is required",
      }),
      branchLocation: Joi.string().min(3).max(25).required().messages({
        "string.empty": "Branch location is required",
      }),
      companyId: Joi.string()
        .required()
        .custom(isValidMongoDBObjectId, "Invalid MongoDB ObjectId")
        .messages(isValidMongoDBObjectIdCustomMessages),
    })
    .min(1),
};

const getAllBranchesValidation = {
  query: Joi.object().keys({
    branchName: Joi.string().optional(),
    branchLocation: Joi.string().optional(),
    branchId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    companyId: Joi.string().optional().custom(isValidMongoDBObjectId),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),
    sortBy: Joi.string().optional(),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
    searchTerm: Joi.string().trim().optional(),
    createdAtFrom: Joi.date().iso().optional(),
    createdAtTo: Joi.date().iso().optional(),
  }),
};

const getBranchByIdValidation = {
  params: Joi.object().keys({
    branchId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const updateBranchValidation = {
  params: Joi.object().keys({
    branchId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object()
    .keys({
      branchName: Joi.string().min(3).max(25).optional(),
      branchLocation: Joi.string().min(3).max(25).optional(),
    })
    .min(1),
};

const deleteBranchValidation = {
  params: Joi.object().keys({
    branchId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const deleteBranchesValidation = {
  body: Joi.object().keys({
    branchIds: Joi.array()
      .items(
        Joi.required()
          .custom(isValidMongoDBObjectId)
          .messages(isValidMongoDBObjectIdCustomMessages)
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one branch ID is required",
        "any.required": "Branch IDs are required",
      }),
  }),
};

const getBranchesByOrganizationIdValidation = {
  params: Joi.object().keys({
    organizationId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

export default {
  createBranchValidation,
  getAllBranchesValidation,
  getBranchByIdValidation,
  updateBranchValidation,
  deleteBranchValidation,
  deleteBranchesValidation,
  getBranchesByOrganizationIdValidation,
};

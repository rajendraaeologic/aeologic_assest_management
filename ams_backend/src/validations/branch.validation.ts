import Joi from "joi";

import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createBranchValidation = {
  body: Joi.object()
    .keys({
      name: Joi.string().required().messages({
        "string.empty": "Branch name is required",
      }),
      location: Joi.string().required().messages({
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
    name: Joi.string().optional(),
    location: Joi.string().optional(),
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
      name: Joi.string().optional(),
      location: Joi.string().optional(),
      companyId: Joi.optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
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

export default {
  createBranchValidation,
  getAllBranchesValidation,
  getBranchByIdValidation,
  updateBranchValidation,
  deleteBranchValidation,
  deleteBranchesValidation,
};

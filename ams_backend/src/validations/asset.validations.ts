import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createAssetValidation = {
  body: Joi.object()
    .keys({
      assetName: Joi.string().min(3).max(25).required(),
      uniqueId: Joi.string().required().min(3).max(25),
      description: Joi.string().min(10).max(200).allow("").optional(),
      brand: Joi.string().allow("").optional().min(3).max(15),
      model: Joi.string().allow("").optional().min(3).max(15),
      serialNumber: Joi.string().allow("").optional().min(3).max(15),
      // purchaseDate: Joi.date().optional(),
      // cost: Joi.number().optional(),
      // warrantyEndDate: Joi.date().optional(),
      status: Joi.string().optional(),
      // categoryId: Joi.string()
      //   .allow(null)
      //   .optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      // locationId: Joi.string()
      //   .allow(null)
      //   .optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      // assignedToUserId: Joi.string()
      //   .allow(null)
      //   .optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      branchId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
      departmentId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
      companyId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
    })
    .min(1),
};

export const getAllAssetsValidation = {
  query: Joi.object().keys({
    assetName: Joi.string().optional(),
    status: Joi.string()
      .valid(
        "IN_USE",
        "UNASSIGNED",
        "ASSIGNED",
        "MAINTENANCE",
        "RETIRED",
        "ASSIGNED",
        "LOST",
        "DAMAGED",
        "IN_REPAIR",
        "DISPOSED"
      )
      .optional(),
    branchId: Joi.string()
      .allow(null)
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    departmentId: Joi.string()
      .allow(null)
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
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
    searchTerm: Joi.string().trim().optional(),
    sortBy: Joi.string()
      .valid(
        "assetName",
        "status",
        "purchaseDate",
        "cost",
        "createdAt",
        "updatedAt"
      )
      .optional(),
    sortType: Joi.string().valid("asc", "desc").optional(),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
  }),
};

module.exports = { getAllAssetsValidation };

const getAssetByIdValidation = {
  params: Joi.object().keys({
    assetId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const updateAssetValidation = {
  params: Joi.object().keys({
    assetId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object()
    .keys({
      assetName: Joi.string().optional().min(3).max(25),
      uniqueId: Joi.string().optional(),
      description: Joi.string().allow("").optional().min(3).max(200),
      brand: Joi.string().allow("").optional().min(3).max(15),
      model: Joi.string().allow("").optional().min(3).max(15),
      serialNumber: Joi.string().allow("").optional().min(3).max(15),
      // purchaseDate: Joi.date().optional(),
      // cost: Joi.number().optional(),
      // warrantyEndDate: Joi.date().optional(),
      status: Joi.string().optional(),
      // categoryId: Joi.string()
      //   .allow(null)
      //   .optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      // locationId: Joi.string()
      //   .allow(null)
      //   .optional()
      //   .custom(isValidMongoDBObjectId)
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      // assignedToUserId: Joi.string()
      //   .allow(null, "")
      //   .optional()
      //   .custom((value, helpers) => {
      //     if (value === null || value === "") return value; // Allow null/empty
      //     return isValidMongoDBObjectId(value, helpers);
      //   })
      //   .messages(isValidMongoDBObjectIdCustomMessages),
      branchId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
      departmentId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
      companyId: Joi.string()
        .allow(null)
        .optional()
        .custom(isValidMongoDBObjectId)
        .messages(isValidMongoDBObjectIdCustomMessages),
    })
    .min(1),
};

const deleteAssetValidation = {
  params: Joi.object().keys({
    assetId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const bulkDeleteAssetsValidation = {
  body: Joi.object().keys({
    assetIds: Joi.array()
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
  createAssetValidation,
  getAllAssetsValidation,
  getAssetByIdValidation,
  updateAssetValidation,
  deleteAssetValidation,
  bulkDeleteAssetsValidation,
};

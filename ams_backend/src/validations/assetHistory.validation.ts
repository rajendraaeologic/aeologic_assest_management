import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const getAssetHistories = {
  query: Joi.object().keys({
    assetId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    userId: Joi.string()
      .optional()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
    action: Joi.string().optional(),
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
    sortBy: Joi.string().valid("timestamp", "action").default("timestamp"),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
    searchTerm: Joi.string().allow("").optional(),
  }),
};

const getAssetHistoryById = {
  params: Joi.object().keys({
    historyId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const getAssetHistoryByAssetId = {
  params: Joi.object().keys({
    assetId: Joi.string()
      .required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  query: Joi.object().keys({
    action: Joi.string().optional(),
    userId: Joi.string()
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
    sortBy: Joi.string().valid("timestamp", "action").default("timestamp"),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

export default {
  getAssetHistories,
  getAssetHistoryById,
  getAssetHistoryByAssetId,
};

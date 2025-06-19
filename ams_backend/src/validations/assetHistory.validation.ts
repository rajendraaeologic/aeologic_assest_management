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
    timestampFrom: Joi.date().iso().optional(),
    timestampTo: Joi.date()
        .iso()
        .optional()
        .custom((value, helpers) => {
          if (
              helpers.state.ancestors[0].timestampFrom &&
              value < helpers.state.ancestors[0].timestampFrom
          ) {
            return helpers.error("date.timestampTo.lessThanTimestampFrom");
          }
          return value;
        })
        .messages({
          "date.timestampTo.lessThanTimestampFrom":
              '"timestampTo" must be greater than "timestampFrom"',
        }),
    sortBy: Joi.string().valid("timestamp", "action").default("timestamp"),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
    searchTerm: Joi.string().allow("").optional(),
  })

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
    timestampFrom: Joi.date().iso().optional(),
    timestampTo: Joi.date()
        .iso()
        .optional()
        .custom((value, helpers) => {
          if (
              helpers.state.ancestors[0].timestampFrom &&
              value < helpers.state.ancestors[0].timestampFrom
          ) {
            return helpers.error("date.timestampTo.lessThanTimestampFrom");
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

import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

export const getUserAssignAssetValidation = {
  query: Joi.object().keys({
    status: Joi.string().optional(),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),

    sortBy: Joi.string().valid("assignedAt", "assetName").default("assignedAt"),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

export default {
  getUserAssignAssetValidation,
};

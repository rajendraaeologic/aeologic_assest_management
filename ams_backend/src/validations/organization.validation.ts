import Joi from "joi";
import {
  isValidMongoDBObjectId,
  isValidMongoDBObjectIdCustomMessages,
} from "@/validations/custom.validation";

const createOrganizationValidation = {
  body: Joi.object()
    .keys({
      organizationName: Joi.string().min(3).max(25).required(),
    })
    .min(1),
};

const getAllOrganizationsValidation = {
  query: Joi.object().keys({
    organizationName: Joi.string().optional(),
    from_date: Joi.string().optional().isoDate(),
    to_date: Joi.string().optional().isoDate(),
    sortBy: Joi.string(),
    sortType: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchTerm: Joi.string().trim().optional(),
    createdAtFrom: Joi.date().iso().optional(),
    createdAtTo: Joi.date().iso().optional(),
  }),
};

const getOrganizationByIdValidation = {
  params: Joi.object().keys({
    organizationId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const updateOrganizationValidation = {
  params: Joi.object().keys({
    organizationId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
  body: Joi.object()
    .keys({
      organizationName: Joi.string().min(3).max(25).optional(),
    })
    .min(1),
};

const deleteOrganizationValidation = {
  params: Joi.object().keys({
    organizationId: Joi.required()
      .custom(isValidMongoDBObjectId)
      .messages(isValidMongoDBObjectIdCustomMessages),
  }),
};

const bulkDeleteOrganizations = {
  body: Joi.object().keys({
    organizationIds: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        "array.base": '"organizationIds" must be an array',
        "array.min": "At least one organization ID is required",
        "string.pattern.base": "Each ID must be a valid MongoDB ID",
      }),
  }),
};

export default {
  createOrganizationValidation,
  getAllOrganizationsValidation,
  getOrganizationByIdValidation,
  updateOrganizationValidation,
  deleteOrganizationValidation,
  bulkDeleteOrganizations,
};

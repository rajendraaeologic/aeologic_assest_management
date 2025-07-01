// dashboard.validation.ts
import Joi from "joi";

const getDashboardCountsValidation = {
  query: Joi.object({
    period: Joi.string().valid('7days', '4weeks', '6months', '12months').default('7days')
  })
};

export default {
  getDashboardCountsValidation,
};
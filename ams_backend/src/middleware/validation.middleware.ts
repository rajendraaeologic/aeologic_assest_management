import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import {NextFunction, Request, Response} from "express";
import pick from "@/lib/pick";
import Joi, {ObjectSchema, ValidationError, ValidationErrorItem} from "joi";

type ValidationSchema = {
  [key in 'body' | 'query' | 'params']?: ObjectSchema;
};
const validate = (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(obj);
  if (error) {
    const errorMessage = error.details.map((details: ValidationErrorItem) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};


async function resolveSchema(schema: ObjectSchema, data: any): Promise<any> {
  const validationOptions: Joi.AsyncValidationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
    errors: { label: 'key' },
  };

  try {
    const result = await schema.validateAsync(data, validationOptions);
    const resolved: any = {};
    const errors: ValidationErrorItem[] = [];

    for (const [key, value] of Object.entries(result)) {
      if (value instanceof Promise) {
        resolved[key] = await value;
      } else {
        resolved[key] = value;
      }

      if (resolved[key] && typeof resolved[key] === 'object' && 'code' in resolved[key]) {
        const { code, path, local } = resolved[key];
        const messageTemplate = resolved[key].messages[code]?.rendered || 'Validation failed';
        const message = messageTemplate.replace('{{#label}}', local?.label || key);
        errors.push({
          message,
          path: path || [key],
          type: code,
          context: { key, value: resolved[key] },
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors, data);
    }

    return resolved;
  } catch (error) {
    if (error instanceof ValidationError) {
      const errors: ValidationErrorItem[] = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
        type: detail.type,
        context: detail.context,
      }));

      throw new ValidationError('Validation failed', errors, data);
    } else {
      throw error;
    }
  }
}

export const validateAsync = (schema: ValidationSchema) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {
    for (const [key, schemaValue] of Object.entries(schema)) {
      if (schemaValue) {
        req[key as 'body' | 'query' | 'params'] = await resolveSchema(schemaValue, req[key as keyof Request]);
      }
    }
    next();
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      const errorMessage = error.details.map((details: ValidationErrorItem) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    next(error);
  }
};

export default validate;

import Joi from 'joi';
import { config } from "dotenv";
config();

const envSchema = Joi.object().keys({
    NODE_ENV: Joi.string().valid("local","development", "production").default("development"),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    APP_URL: Joi.string().default('http://localhost:3000'),
    API_PREFIX: Joi.string().default('/api/v1'),
    UPLOAD_DIR: Joi.string().default('./uploads'),
    EMAIL_FROM: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_DAYS: Joi.string().default(2),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.string().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.string().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.string().default(10),
    API_LIMITER_WINDOW_MS: Joi.string().default(5),
    API_LIMITER_LIMIT: Joi.string().default(5),
    COVER_IMAGE_SIZE_LIMIT: Joi.string().default(2048),
    VIDEO_SIZE_LIMIT: Joi.string().default(2048),
    DOCUMENT_SIZE_LIMIT: Joi.string().default(2048),
    SMS_SERVICE_ENABLED: Joi.string().default('false'),
    BULK_SMS_BASE_URL: Joi.string().required(),
    BULK_SMS_API_TOKEN_ID: Joi.string().required(),
    BULK_SMS_API_TOKEN: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    }).unknown();

const { value: envVars, error } = envSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const env = envVars;

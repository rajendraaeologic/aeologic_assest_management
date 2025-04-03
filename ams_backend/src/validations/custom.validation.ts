import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const password: Joi.CustomValidator<string> = (value, helpers) => {
    if (value.length < 8) {
        return helpers.error('minPassword');
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.error('customPassword');
    }
    return value;
};

export const passwordCustomMessages: Joi.LanguageMessages = {
    minPassword: '{{#label}} must be at least 8 characters',
    customPassword: '{{#label}} must contain at least 1 letter and 1 number'
};

export const isValidMongoDBObjectId: Joi.CustomValidator<string> = (value, helpers) => {
    if (!ObjectId.isValid(value)) {
        return helpers.error('invalidObjectId');
    }
    return value;
};

export const isValidMongoDBObjectIdCustomMessages: Joi.LanguageMessages = {
    invalidObjectId: '{{#label}} must contain a valid ID'
};
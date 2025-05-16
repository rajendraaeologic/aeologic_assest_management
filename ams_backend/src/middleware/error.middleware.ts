import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import appConfig from '@/config/app';
import logger from '@/config/logger';
import ApiError from '@/lib/ApiError';

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof Prisma.PrismaClientKnownRequestError
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (appConfig.env === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(['local','development'].includes(appConfig.env) && { stack: err.stack })
    };

    if (['local','development'].includes(appConfig.env)) {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};

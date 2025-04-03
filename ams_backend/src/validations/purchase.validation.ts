import {PaymentStatus } from '@prisma/client';
import Joi from 'joi';

const getPurchases = {
    query: Joi.object().keys({
        invoiceCode: Joi.string().optional(),
        name: Joi.string().optional(),
        status: Joi.string().optional().valid(PaymentStatus.PENDING,PaymentStatus.PAYMENT_INITIATED, PaymentStatus.COMPLETED, PaymentStatus.FAILED),
        from_date: Joi.string().optional().isoDate(),
        to_date: Joi.string().optional().isoDate(),
        sortBy: Joi.string(),
        sortType: Joi.string().valid('asc', 'desc').default('desc'),
        limit: Joi.number().integer(),
        page: Joi.number().integer()
    }),
}


export default {
    getPurchases,
};
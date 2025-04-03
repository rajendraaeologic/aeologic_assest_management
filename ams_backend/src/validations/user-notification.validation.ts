import Joi from 'joi';

const getUserNotifications = {
    query: Joi.object().keys({
        hasRead: Joi.boolean().optional(),
        from_date: Joi.string().optional().isoDate(),
        to_date: Joi.string().optional().isoDate(),
        sortBy: Joi.string(),
        sortType: Joi.string().valid('asc', 'desc').default('desc'),
        limit: Joi.number().integer(),
        page: Joi.number().integer()
    }),
};

const markUserNotificationAsRead = {
    body: Joi.object().keys({
        notificationIds: Joi.array().required().min(1),
    }),
};

export default {
    getUserNotifications,
    markUserNotificationAsRead,
};
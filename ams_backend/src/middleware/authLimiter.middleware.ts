import rateLimit from 'express-rate-limit';
import config from '@/config/app';

export const authLimiter = rateLimit({
    windowMs: config.limiter.windowMs,
    limit: config.limiter.limit,
    skipSuccessfulRequests: true
});
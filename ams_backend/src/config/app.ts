import {env} from "@/lib/env";
import path from "path";

export default {
    appUrl: env.APP_URL,
    apiPrefix: env.API_PREFIX,
    baseAPI: env.APP_URL + env.API_PREFIX,
    env: env.NODE_ENV,
    port: env.PORT,
    mimetypes: {
        images: ['image/jpeg', 'image/jpg', 'image/png'],
        videos: ['video/mp4', 'video/quicktime'],
        pdf: ['application/pdf'],
    },
    uploads: {
        uploadDir: path.resolve(env.UPLOAD_DIR),
        educationalResource: {
            coverImageSizeLimit: parseInt(env.COVER_IMAGE_SIZE_LIMIT),
            videoSizeLimit: parseInt(env.VIDEO_SIZE_LIMIT)
        },
        documentSizeLimit: parseInt(env.DOCUMENT_SIZE_LIMIT),
    },

    jwt: {
        secret: env.JWT_SECRET,
        accessExpirationDays: parseInt(env.JWT_ACCESS_EXPIRATION_DAYS),
        refreshExpirationDays: parseInt(env.JWT_REFRESH_EXPIRATION_DAYS),
        resetPasswordExpirationMinutes: parseInt(env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES),
        verifyEmailExpirationMinutes: parseInt(env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES),
    },
    sms :{
        otpTemplate: "Your Shiksha OTP code is {{otp}}. Please do not share this code with anyone.",
        enabled: env.SMS_SERVICE_ENABLED === 'true',
        bulkSmsUrl: env.BULK_SMS_BASE_URL,
        bulkSmsApiTokenId: env.BULK_SMS_API_TOKEN_ID,
        bulkSmsApiToken: env.BULK_SMS_API_TOKEN,
    },
    aws: {
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        },
        region: env.AWS_REGION
    },
    email: {
        from: env.EMAIL_FROM
    },
    limiter: {
        windowMs: parseInt(env.API_LIMITER_WINDOW_MS),
        limit: parseInt(env.API_LIMITER_LIMIT),
    }
}

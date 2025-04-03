import path from "path";
import appConfig from "@/config/app";
import fs from "fs/promises";
import multer from "multer";
import {NextFunction, Request, Response} from "express-serve-static-core";
import {User} from "@prisma/client";
import ApiError from "@/lib/ApiError";
import httpStatus from "http-status";

declare global {
    namespace Express {
        namespace Multer {
            interface File {
                relativePath?: string,
                [key: string]: any;
            }
        }
    }
}

const ensureUploadDir = async (userId: string) => {
    const userDir = path.join(appConfig.uploads.uploadDir, userId);
    await fs.mkdir(userDir, { recursive: true });
    return userDir;
};

interface FileValidationRules {
    [key: string]: {
        allowedMimeTypes: string[];
        maxSize: number; // in bytes
    };
}

const isValidFileType = (mimetype: string, allowedTypes: string[]) => allowedTypes.includes(mimetype);

export const createUploadMiddleware = (validationRules: FileValidationRules) => {
    const storage = multer.diskStorage({
        destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            try {
                const user = req.user as User;
                const userDir = await ensureUploadDir(user.id);
                cb(null, userDir);
            } catch (error) {
                cb(new ApiError(httpStatus.INTERNAL_SERVER_ERROR,'Upload directory not found'), '');
            }
        },
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;

            // Calculate and store the relative path in file.metadata
            const user = req.user as User;
            file.relativePath = path.join(user.id, filename);
            cb(null, filename);
        },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const rules = validationRules[file.fieldname];
        if (!rules) {
            return cb(new ApiError(httpStatus.BAD_REQUEST, `Unexpected field: ${file.fieldname}`));
        }

        if (!isValidFileType(file.mimetype, rules.allowedMimeTypes)) {
            return cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type for ${file.fieldname}`));
        }

        cb(null, true);
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: Math.max(...Object.values(validationRules).map(rule => rule.maxSize)),
        },
    });

    return (req: Request, res: Response, next: NextFunction) => {
        const uploadFields = Object.keys(validationRules).map(field => ({ name: field, maxCount: 1 }));

        upload.fields(uploadFields)(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ApiError(httpStatus.BAD_REQUEST, `File size limit exceeded for ${err.field}`));
                }
                return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
            } else if (err instanceof ApiError) {
                console.error('API error:', err);
                return next(err);
            } else if (err) {
                console.error('Unexpected error during file upload:', err);
                return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred during file upload'));
            }
            next();
        });
};
};

const deleteFile = async (uploadDir: string, filePath: string): Promise<void> => {
    const fullPath = path.resolve(uploadDir, filePath);

    try {
        await fs.unlink(fullPath);
        console.log(`Successfully deleted file at ${fullPath}`);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.warn(`File not found at ${fullPath}`);
        } else {
            console.error(`Failed to delete file at ${fullPath}:`, err);
        }
    }
};


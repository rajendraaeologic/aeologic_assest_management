import appConfig from "../config/app";
import {createUploadMiddleware} from "@/utils/uploader.utils";

export const uploadEducationalFiles = createUploadMiddleware({
    coverImage: {
        allowedMimeTypes: appConfig.mimetypes.images,
        maxSize: appConfig.uploads.educationalResource.coverImageSizeLimit
    },
    video: {
        allowedMimeTypes: appConfig.mimetypes.videos,
        maxSize: appConfig.uploads.educationalResource.videoSizeLimit
    },
});


import path from "path";
import multer from "multer";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const allowedTypes = ["text/csv", "application/vnd.ms-excel"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed!"));
    }
};

export const upload = multer({ storage, fileFilter }).single("file");

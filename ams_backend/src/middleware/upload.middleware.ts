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


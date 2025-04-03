import appConfig from "@/config/app"

export const corsOptions = {
    // origin: [appConfig.appUrl],
    origin: "*",
    optionsSuccessStatus: 204
};
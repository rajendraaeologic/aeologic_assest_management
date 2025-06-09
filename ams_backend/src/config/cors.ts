import appConfig from "@/config/app"

// export const corsOptions = {
//     // origin: [appConfig.appUrl],
//     origin: "*",
//     optionsSuccessStatus: 204
// };
export const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
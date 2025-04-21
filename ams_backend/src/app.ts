import express from "express";
import { config } from "dotenv";
config();

import cors from "cors";
import passport from "passport";
import { jwtStrategy } from "@/config/passport";
import appConfig from "@/config/app";
import compression from "compression";

import router from "@/routes";
import { authLimiter } from "@/middleware/authLimiter.middleware";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { errorConverter, errorHandler } from "@/middleware/error.middleware";
import { corsOptions } from "@/config/cors";
import helmet from "helmet";
import { morganLogger } from "@/middleware/morganLogger.middleware";
import path from "path";

const app = express();
app.set("trust proxy", 1);

app.use(morganLogger);
// set security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// gzip compression
app.use(compression());

// enable cors
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to api endpoints
if (appConfig.env === "production") {
  app.use(appConfig.apiPrefix, authLimiter);
}

app.use("/public", express.static(path.resolve("public")));
app.use("/uploads", express.static(path.resolve(appConfig.uploads.uploadDir)));

app.use(appConfig.apiPrefix, router);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// app.listen(env.NODE_PORT, () => {
//     console.log(`Server is running on port ${env.NODE_PORT}`);
// });

export default app;

import express from "express";
import auth from "@/middleware/auth.middleware";

const router = express.Router();

router.route("/metric").get(auth("getMetric"), dashboardController.getMetric);

export default router;

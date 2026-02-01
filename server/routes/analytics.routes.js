import express from "express";
import { getLinkAnalytics } from "../controllers/analytics.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { analyticsParamsSchema } from "../validations/link.validation.js";

const router = express.Router();

router.get(
    "/:shortCode",
    apiKeyAuth,
    validateRequest({ params: analyticsParamsSchema }),
    getLinkAnalytics
);

export default router;

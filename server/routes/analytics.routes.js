import express from "express";
import { getLinkAnalytics } from "../controllers/analytics.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:shortCode", apiKeyAuth, getLinkAnalytics);

export default router;

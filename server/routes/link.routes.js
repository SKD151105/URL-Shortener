import express from "express";
import { createLink } from "../controllers/link.controller.js";
import { redirectToOriginal } from "../controllers/redirect.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post(
    "/",
    apiKeyAuth,
    rateLimit({
        windowSec: 60,
        max: 10,
        keyFn: (req) => req.user._id.toString()
    }),
    createLink
);
router.get(
    "/:code",
    rateLimit({
        windowSec: 60,
        max: 100,
        keyFn: (req) => req.ip
    }),
    redirectToOriginal
);

export default router;

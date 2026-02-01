import express from "express";
import { createLink } from "../controllers/link.controller.js";
import { redirectToOriginal } from "../controllers/redirect.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createLinkBodySchema, redirectParamsSchema } from "../validations/link.validation.js";

const router = express.Router();

router.post(
    "/",
    apiKeyAuth,
    validateRequest({ body: createLinkBodySchema }),
    rateLimit({
        windowSec: 60,
        max: 10,
        keyFn: (req) => req.user._id.toString()
    }),
    createLink
);
router.get(
    "/:code",
    validateRequest({ params: redirectParamsSchema }),
    rateLimit({
        windowSec: 60,
        max: 100,
        keyFn: (req) => req.ip
    }),
    redirectToOriginal
);

export default router;

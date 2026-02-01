import express from "express";
import { createLink } from "../controllers/link.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createLinkBodySchema } from "../validations/link.validation.js";

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
export default router;

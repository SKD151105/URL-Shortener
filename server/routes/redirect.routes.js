import express from "express";
import { redirectToOriginal } from "../controllers/redirect.controller.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { redirectParamsSchema } from "../validations/link.validation.js";

const router = express.Router();

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

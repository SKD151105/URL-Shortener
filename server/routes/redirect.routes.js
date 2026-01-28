import express from "express";
import { redirectToOriginal } from "../controllers/redirect.controller.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

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

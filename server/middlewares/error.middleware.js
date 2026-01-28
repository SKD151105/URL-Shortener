import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, _next) {
	const statusCode = err?.statusCode || err?.status || 500;
	const message = err?.message || "Internal server error";
	const errors = err?.errors || [];
	const data = err?.data ?? null;

	if (!(err instanceof ApiError)) {
		logger.error("Unhandled error", {
			error: message,
			stack: err?.stack,
			statusCode,
			requestId: req.requestId,
		});
	}

	res.status(statusCode).json({
		success: false,
		message,
		errors,
		data,
		requestId: req.requestId,
	});
}
import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        const status = res.statusCode;
        const method = req.method;
        const path = req.originalUrl || req.url;
        logger.info("HTTP", {
            method,
            path,
            status,
            durationMs: durationMs.toFixed(2),
            requestId: req.requestId,
        });
    });

    return next();
};

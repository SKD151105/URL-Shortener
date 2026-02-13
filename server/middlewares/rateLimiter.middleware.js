import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";

function parseBooleanEnv(name, defaultValue = true) {
    const raw = process.env[name];
    if (raw == null) return defaultValue;
    const value = String(raw).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(value)) return true;
    if (["0", "false", "no", "n", "off"].includes(value)) return false;
    return defaultValue;
}

export function rateLimit({ windowSec, max, keyFn }) {
    return async function (req, res, next) {
        if (!parseBooleanEnv("RATE_LIMIT_ENABLED", true)) {
            return next();
        }

        const key = keyFn(req);
        const redisKey = `rl:${key}`;

        const count = await redis.incr(redisKey);

        if (count === 1) {
            await redis.expire(redisKey, windowSec);
        }

        if (count > max) {
            return next(new ApiError(429, "Too many requests"));
        }

        next();
    };
}

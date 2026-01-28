import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";

export function rateLimit({ windowSec, max, keyFn }) {
    return async function (req, res, next) {
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

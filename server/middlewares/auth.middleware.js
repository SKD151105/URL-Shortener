import { ApiError } from "../utils/ApiError.js";
import { findUserByApiKey } from "../repositories/user.repository.js";

export async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return next(new ApiError(401, "API key required"));
    }

    const user = await findUserByApiKey(apiKey, { lean: true });

    if (!user) {
        return next(new ApiError(403, "Invalid API key"));
    }

    req.user = user;
    next();
}

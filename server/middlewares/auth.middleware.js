import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return next(new ApiError(401, "API key required"));
    }

    const user = await User.findOne({ apiKey });

    if (!user) {
        return next(new ApiError(403, "Invalid API key"));
    }

    req.user = user;
    next();
}

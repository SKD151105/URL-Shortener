import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createShortLink } from "../services/link.service.js";

export async function createLink(req, res, next) {
    try {
        const { url } = req.body;

        if (!url) {
            return next(new ApiError(400, "URL is required"));
        }

        const link = await createShortLink({
            originalUrl: url,
            userId: req.user._id
        });

        res.status(201).json(new ApiResponse(201, link, "Link created"));
    } catch (error) {
        next(error);
    }
}

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createShortLink } from "../services/link.service.js";
import { validateUrl } from "../utils/validateUrl.js";

export async function createLink(req, res, next) {
    try {
        const { url } = req.body;

        if (!url) {
            return next(new ApiError(400, "URL is required"));
        }

        if (!validateUrl(url)) {
            return next(new ApiError(400, "Invalid URL"));
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

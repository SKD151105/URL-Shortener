import { Link } from "../models/link.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export async function createLink(req, res, next) {
    const { url } = req.body;

    if (!url) {
        return next(new ApiError(400, "URL is required"));
    }

    // temporary short code (will improve later)
    const shortCode = Math.random().toString(36).substring(2, 8);

    const link = await Link.create({
        originalUrl: url,
        shortCode,
        userId: req.user._id
    });

    res.status(201).json(new ApiResponse(201, link, "Link created"));
}

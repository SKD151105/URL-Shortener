import { ApiResponse } from "../utils/ApiResponse.js";
import { createShortLink } from "../services/link.service.js";

export async function createLink(req, res, next) {
    try {
        const { url } = req.body;

        const link = await createShortLink({
            originalUrl: url,
            userId: req.user._id
        });
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const shortUrl = `${baseUrl}/api/v1/redirect/${link.shortCode}`;
        const linkData = link?.toObject ? link.toObject() : link;

        res.status(201).json(new ApiResponse(201, { ...linkData, shortUrl }, "Link created"));
    } catch (error) {
        next(error);
    }
}

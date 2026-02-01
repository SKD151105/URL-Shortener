import { ApiResponse } from "../utils/ApiResponse.js";
import { getAnalyticsByShortCode } from "../services/analytics.service.js";

export async function getLinkAnalytics(req, res, next) {
    try {
        const { shortCode } = req.params;
        const data = await getAnalyticsByShortCode(shortCode);
        res.status(200).json(new ApiResponse(200, data, "Analytics fetched"));
    } catch (error) {
        next(error);
    }
}

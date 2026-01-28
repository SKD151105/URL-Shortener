import { Click } from "../models/click.model.js";
import { Link } from "../models/link.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export async function getLinkAnalytics(req, res) {
    const { shortCode } = req.params;

    const link = await Link.findOne({ shortCode });
    if (!link) {
        throw new ApiError(404, "Link not found");
    }

    const totalClicks = await Click.countDocuments({ linkId: link._id });

    res.status(200).json(new ApiResponse(200, { totalClicks }, "Analytics fetched"));
}

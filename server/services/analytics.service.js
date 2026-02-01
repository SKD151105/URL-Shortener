import { ApiError } from "../utils/ApiError.js";
import { countClicksByLinkId } from "../repositories/click.repository.js";
import { findLinkByShortCode } from "../repositories/link.repository.js";

export async function getAnalyticsByShortCode(shortCode) {
    const link = await findLinkByShortCode(shortCode);
    if (!link) {
        throw new ApiError(404, "Link not found");
    }

    const totalClicks = await countClicksByLinkId(link._id);
    return {
        totalClicks,
        link: {
            id: link._id,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl
        }
    };
}

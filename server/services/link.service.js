import { Link } from "../models/link.model.js";
import { generateCode } from "../utils/generateCode.js";
import { ApiError } from "../utils/ApiError.js";

export async function createShortLink({ originalUrl, userId }) {
    const existing = await Link.findOne({ originalUrl, userId });
    if (existing) {
        return existing;
    }

    for (let i = 0; i < 5; i++) {
        const shortCode = generateCode();
        try {
            return await Link.create({ originalUrl, shortCode, userId });
        } catch (err) {
            if (err?.code !== 11000) {
                throw err;
            }
        }
    }

    throw new ApiError(500, "Failed to generate unique short code");
}

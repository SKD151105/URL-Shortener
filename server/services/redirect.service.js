import mongoose from "mongoose";
import { redis } from "../config/redis.js";
import { createClick } from "../repositories/click.repository.js";
import { findLinkByShortCode } from "../repositories/link.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const CACHE_TTL_SECONDS = 60 * 60;

const parseCacheValue = cachedValue => {
    try {
        const parsed = JSON.parse(cachedValue);
        return {
            url: parsed?.url || cachedValue,
            linkId: parsed?.linkId || null,
            isJson: true,
        };
    } catch {
        return { url: cachedValue, linkId: null, isJson: false };
    }
};

const logClick = (linkId, { userAgent, ip }) =>
    createClick({ linkId, userAgent, ip }).catch(error => {
        logger.warn("Click log failed", { error: error?.message, linkId });
    });

export async function getRedirectUrl({ code, userAgent, ip }) {
    // 1. cache first
    const cachedValue = await redis.get(code);
    if (cachedValue) {
        const { url: cachedUrl, linkId: cachedLinkId, isJson } = parseCacheValue(cachedValue);
        const isValidId = cachedLinkId && mongoose.Types.ObjectId.isValid(cachedLinkId);

        let resolvedLinkId = cachedLinkId;
        if (!isValidId) {
            const link = await findLinkByShortCode(code, { projection: { _id: 1 }, lean: true });
            resolvedLinkId = link?._id || null;
        }

        if (!resolvedLinkId) {
            await redis.del(code);
            throw new ApiError(404, "Link not found");
        }

        if (!isJson) {
            await redis.set(
                code,
                JSON.stringify({ url: cachedUrl, linkId: resolvedLinkId }),
                "EX",
                CACHE_TTL_SECONDS
            );
        }

        logClick(resolvedLinkId, { userAgent, ip });
        return cachedUrl;
    }

    // 2. DB fallback
    const link = await findLinkByShortCode(code, { lean: true });
    if (!link) {
        throw new ApiError(404, "Link not found");
    }

    // 3. cache result (1 hour)
    await redis.set(
        code,
        JSON.stringify({ url: link.originalUrl, linkId: link._id }),
        "EX",
        CACHE_TTL_SECONDS
    );

    // 4. log click
    logClick(link._id, { userAgent, ip });

    // 5. return redirect url
    return link.originalUrl;
}

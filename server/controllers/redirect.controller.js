import mongoose from "mongoose";
import { redis } from "../config/redis.js";
import { Link } from "../models/link.model.js";
import { Click } from "../models/click.model.js";
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

const logClick = (linkId, req) =>
    Click.create({
        linkId,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
    }).catch(error => {
        logger.warn("Click log failed", { error: error?.message, linkId });
    });

export async function redirectToOriginal(req, res, next) {
    const { code } = req.params;

    // 1. cache first
    const cachedValue = await redis.get(code);
    if (cachedValue) {
        const { url: cachedUrl, linkId: cachedLinkId, isJson } = parseCacheValue(cachedValue);
        const isValidId = cachedLinkId && mongoose.Types.ObjectId.isValid(cachedLinkId);

        let resolvedLinkId = cachedLinkId;
        if (!isValidId) {
            const link = await Link.findOne({ shortCode: code }, { _id: 1 }).lean();
            resolvedLinkId = link?._id || null;
        }

        if (!resolvedLinkId) {
            await redis.del(code);
            return res.status(404).json({ message: "Link not found" });
        }

        if (!isJson) {
            await redis.set(
                code,
                JSON.stringify({ url: cachedUrl, linkId: resolvedLinkId }),
                "EX",
                CACHE_TTL_SECONDS
            );
        }

        logClick(resolvedLinkId, req);
        return res.redirect(cachedUrl);
    }

    // 2. DB fallback
    const link = await Link.findOne({ shortCode: code }).lean();
    if (!link) {
        return res.status(404).json({ message: "Link not found" });
    }

    // 3. cache result (1 hour)
    await redis.set(
        code,
        JSON.stringify({ url: link.originalUrl, linkId: link._id }),
        "EX",
        CACHE_TTL_SECONDS
    );

    // 4. redirect
    res.redirect(link.originalUrl);

    // 5. log click
    logClick(link._id, req);
}

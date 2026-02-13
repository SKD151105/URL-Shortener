import mongoose from "mongoose";
import { redis } from "../config/redis.js";
import { createClick } from "../repositories/click.repository.js";
import { findLinkByShortCode } from "../repositories/link.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const CACHE_TTL_SECONDS = 60 * 60;
const NEGATIVE_CACHE_TTL_SECONDS = 60;
const NEGATIVE_CACHE_VALUE = "__NOT_FOUND__";

function parseBooleanEnv(name, defaultValue = true) {
    const raw = process.env[name];
    if (raw == null) return defaultValue;
    const value = String(raw).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(value)) return true;
    if (["0", "false", "no", "n", "off"].includes(value)) return false;
    return defaultValue;
}

const CACHE_ENABLED = parseBooleanEnv("CACHE_ENABLED", true);
const NEGATIVE_CACHE_ENABLED = parseBooleanEnv("NEGATIVE_CACHE_ENABLED", true);
const CLICK_LOG_ENABLED = parseBooleanEnv("CLICK_LOG_ENABLED", true);

const parseCacheValue = cachedValue => {
    if (cachedValue === NEGATIVE_CACHE_VALUE) {
        return { url: null, linkId: null, isJson: false, isNotFound: true };
    }
    try {
        const parsed = JSON.parse(cachedValue);
        return {
            url: parsed?.url || cachedValue,
            linkId: parsed?.linkId || null,
            isJson: true,
            isNotFound: false,
        };
    } catch {
        return { url: cachedValue, linkId: null, isJson: false, isNotFound: false };
    }
};

const logClick = (linkId, { userAgent, ip }) =>
    CLICK_LOG_ENABLED
        ? createClick({ linkId, userAgent, ip }).catch(error => {
              logger.warn("Click log failed", { error: error?.message, linkId });
          })
        : undefined;

export async function getRedirectUrl({ code, userAgent, ip }) {
    // 1. cache first (optional)
    if (CACHE_ENABLED) {
        const cachedValue = await redis.get(code);
        if (cachedValue) {
            const { url: cachedUrl, linkId: cachedLinkId, isJson, isNotFound } = parseCacheValue(cachedValue);

            // If negative caching is disabled, ignore stored negative entries.
            if (isNotFound) {
                if (NEGATIVE_CACHE_ENABLED) {
                    throw new ApiError(404, "Link not found");
                }
            } else {
                const isValidId = cachedLinkId && mongoose.Types.ObjectId.isValid(cachedLinkId);

                let resolvedLinkId = cachedLinkId;
                if (!isValidId) {
                    const link = await findLinkByShortCode(code, { projection: { _id: 1 }, lean: true });
                    resolvedLinkId = link?._id || null;
                }

                if (!resolvedLinkId) {
                    if (NEGATIVE_CACHE_ENABLED) {
                        await redis.set(code, NEGATIVE_CACHE_VALUE, "EX", NEGATIVE_CACHE_TTL_SECONDS);
                    }
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
        }
    }

    // 2. DB fallback
    const link = await findLinkByShortCode(code, { lean: true });
    if (!link) {
        if (CACHE_ENABLED && NEGATIVE_CACHE_ENABLED) {
            await redis.set(code, NEGATIVE_CACHE_VALUE, "EX", NEGATIVE_CACHE_TTL_SECONDS);
        }
        throw new ApiError(404, "Link not found");
    }

    // 3. cache result (1 hour)
    if (CACHE_ENABLED) {
        await redis.set(
            code,
            JSON.stringify({ url: link.originalUrl, linkId: link._id }),
            "EX",
            CACHE_TTL_SECONDS
        );
    }

    // 4. log click
    logClick(link._id, { userAgent, ip });

    // 5. return redirect url
    return link.originalUrl;
}

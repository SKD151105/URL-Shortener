import { Link } from "../models/link.model.js";

function parseBooleanEnv(name, defaultValue = false) {
    const raw = process.env[name];
    if (raw == null) return defaultValue;
    const value = String(raw).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(value)) return true;
    if (["0", "false", "no", "n", "off"].includes(value)) return false;
    return defaultValue;
}

export function findLinkByOriginalUrlAndUser(originalUrl, userId, { lean = false } = {}) {
    let query = Link.findOne({ originalUrl, userId });
    if (lean) {
        query = query.lean();
    }
    return query;
}

export function findLinkByShortCode(shortCode, { projection = null, lean = false } = {}) {
    if (parseBooleanEnv("DB_LOOKUP_COUNTER", false)) {
        console.count("DB_LOOKUP");
    }
    let query = Link.findOne({ shortCode }, projection);
    if (lean) {
        query = query.lean();
    }
    return query;
}

export function createLink({ originalUrl, shortCode, userId }) {
    return Link.create({ originalUrl, shortCode, userId });
}

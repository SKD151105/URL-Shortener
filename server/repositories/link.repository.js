import { Link } from "../models/link.model.js";

export function findLinkByOriginalUrlAndUser(originalUrl, userId, { lean = false } = {}) {
    let query = Link.findOne({ originalUrl, userId });
    if (lean) {
        query = query.lean();
    }
    return query;
}

export function findLinkByShortCode(shortCode, { projection = null, lean = false } = {}) {
    let query = Link.findOne({ shortCode }, projection);
    if (lean) {
        query = query.lean();
    }
    return query;
}

export function createLink({ originalUrl, shortCode, userId }) {
    return Link.create({ originalUrl, shortCode, userId });
}

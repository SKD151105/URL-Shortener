import { Click } from "../models/click.model.js";

export function createClick({ linkId, userAgent, ip }) {
    return Click.create({ linkId, userAgent, ip });
}

export function countClicksByLinkId(linkId) {
    return Click.countDocuments({ linkId });
}

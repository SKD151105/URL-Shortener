import { redis } from "../config/redis.js";
import { Link } from "../models/link.model.js";

export async function redirectToOriginal(req, res, next) {
    const { code } = req.params;

    // 1. cache first
    const cachedUrl = await redis.get(code);
    if (cachedUrl) {
        console.log("REDIS HIT");
        return res.redirect(cachedUrl);
    }

    // 2. DB fallback
    const link = await Link.findOne({ shortCode: code });
    if (!link) {
        return res.status(404).json({ message: "Link not found" });
    }

    // 3. cache result (1 hour)
    await redis.set(code, link.originalUrl, "EX", 60 * 60);

    // 4. redirect
    res.redirect(link.originalUrl);
}

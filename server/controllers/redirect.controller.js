import { getRedirectUrl } from "../services/redirect.service.js";

export async function redirectToOriginal(req, res, next) {
    try {
        const redirectUrl = await getRedirectUrl({
            code: req.params.code,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
        });

        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
}

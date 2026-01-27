import crypto from "crypto";

// trace requests in logs
export const requestId = (req, _res, next) => {
	req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
	next();
};
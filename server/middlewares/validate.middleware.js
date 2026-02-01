import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validateRequest({ body, params, query } = {}) {
    return function (req, _res, next) {
        try {
            if (body) {
                req.body = body.parse(req.body);
            }
            if (params) {
                req.params = params.parse(req.params);
            }
            if (query) {
                req.query = query.parse(req.query);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ApiError(400, "Validation error", error.errors));
            }
            next(error);
        }
    };
}

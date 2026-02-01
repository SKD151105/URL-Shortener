import { User } from "../models/user.model.js";

export function findUserByApiKey(apiKey, { lean = false } = {}) {
    let query = User.findOne({ apiKey });
    if (lean) {
        query = query.lean();
    }
    return query;
}

import express from "express";
import { User } from "../models/user.model.js";
import { generateApiKey } from "../utils/generateApiKey.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

router.post("/create-user", async (req, res) => {
    const user = await User.create({
        name: "admin",
        apiKey: generateApiKey()
    });

    res.status(201).json(new ApiResponse(201, { apiKey: user.apiKey }, "API key created"));
});

export default router;

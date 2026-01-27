import express from "express";
import { User } from "../models/user.model.js";
import { generateApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

router.post("/create-user", async (req, res) => {
    const user = await User.create({
        name: "admin",
        apiKey: generateApiKey()
    });

    res.json({ apiKey: user.apiKey });
});

export default router;

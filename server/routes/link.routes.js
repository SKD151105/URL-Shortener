import express from "express";
import { createLink } from "../controllers/link.controller.js";
import { apiKeyAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", apiKeyAuth, createLink);

export default router;

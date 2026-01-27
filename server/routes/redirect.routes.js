import express from "express";
import { redirectToOriginal } from "../controllers/redirect.controller.js";

const router = express.Router();

router.get("/:code", redirectToOriginal);

export default router;

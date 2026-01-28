import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import devRoutes from "./routes/dev.routes.js";
import linkRoutes from "./routes/link.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import redirectRoutes from "./routes/redirect.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { requestId } from "./middlewares/requestId.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

const app = express();

app.use(requestId);
app.use(requestLogger);
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    res.status(200).json(new ApiResponse(200, { status: "ok" }, "Service healthy"));
});

app.use("/api/v1/dev", devRoutes);
app.use("/api/v1/links", linkRoutes);
app.use("/api/v1/redirect", redirectRoutes);
// app.use("/", redirectRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

export default app;

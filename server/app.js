import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import linkRoutes from "./routes/link.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import redirectRoutes from "./routes/redirect.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { requestId } from "./middlewares/requestId.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

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

app.use("/api/v1/links", linkRoutes);
app.use("/api/v1/redirect", redirectRoutes);
// app.use("/", redirectRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use((req, _res, next) => {
    next(new ApiError(404, "Not found"));
});

app.use(errorHandler);

export default app;

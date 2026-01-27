import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import devRoutes from "./routes/dev.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/dev", devRoutes);
export default app;

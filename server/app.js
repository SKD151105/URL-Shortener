import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";

const app = express();

app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;

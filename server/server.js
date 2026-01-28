import "dotenv/config";
import { logger } from "./utils/logger.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import { validateEnv } from "./config/env.js";

const PORT = process.env.PORT || 5000;

let server;

const listenAsync = (port) => {
    return new Promise((resolve, reject) => {
        const instance = app
            .listen(port, () => {
                logger.info(`Server running on port ${port}`);
                resolve(instance);
            })
            .on("error", reject);
    });
};

const startServer = async () => {
    try {
        validateEnv();
        await connectDB();
        server = await listenAsync(PORT);
    } catch (error) {
        logger.error("Server startup error:", { error });
        process.exit(1);
    }
};

startServer();

const shutdown = () => {
    logger.info("Shutting down...");
    if (server) {
        server.close(() => process.exit(0));
        return;
    }
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
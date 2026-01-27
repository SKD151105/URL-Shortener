import "dotenv/config";
import { logger } from "./utils/logger.js";
// import connectDB from "./db/index.js";
import app from "./app.js";
// import { validateEnv } from "./utils/env.js";

const PORT = process.env.PORT || 5000;

const listenAsync = (port) => {
    return new Promise((resolve, reject) => {
        const server = app
            .listen(port, () => {
                logger.info(`Server running on port ${port}`);
                resolve(server);
            })
            .on("error", reject);
    });
};

const startServer = async () => {
    try {
        // validateEnv();
        // await connectDB();
        await listenAsync(PORT); 
    } catch (error) {
        logger.error("Server startup error:", { error });
        process.exit(1);
    }
};

startServer();
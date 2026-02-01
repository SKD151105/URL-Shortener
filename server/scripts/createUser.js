import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { generateApiKey } from "../utils/generateApiKey.js";

async function main() {
    const [,, name] = process.argv;
    if (!name) {
        console.error("Usage: node scripts/createUser.js <name>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const apiKey = generateApiKey();
    try {
        const user = await User.create({ name, apiKey });
        console.log("User created:", {
            id: user._id,
            name: user.name,
            apiKey: user.apiKey,
        });
    } catch (err) {
        console.error("Error creating user:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

main();

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { generateApiKey } from "../utils/generateApiKey.js";

async function main() {
    const [,, username, email] = process.argv;
    if (!username || !email) {
        console.error("Usage: node scripts/createUser.js <username> <email>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const apiKey = generateApiKey();
    try {
        const user = await User.create({ username, email, apiKey });
        console.log("User created:", {
            id: user._id,
            username: user.username,
            email: user.email,
            apiKey: user.apiKey,
        });
    } catch (err) {
        console.error("Error creating user:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

main();

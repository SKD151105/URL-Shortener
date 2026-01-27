import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            index: true
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

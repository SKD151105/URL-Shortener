import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
    {
        originalUrl: {
            type: String,
            required: true
        },
        shortCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

export const Link = mongoose.model("Link", linkSchema);

import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
    {
        linkId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Link",
            required: true
        },
        userAgent: String,
        ip: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

clickSchema.index({ linkId: 1, createdAt: -1 });

export const Click = mongoose.model("Click", clickSchema);

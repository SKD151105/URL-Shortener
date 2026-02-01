import { z } from "zod";

const shortCodeSchema = z
    .string()
    .min(1)
    .max(32)
    .regex(/^[A-Za-z0-9]+$/, "Short code must be alphanumeric");

export const createLinkBodySchema = z.object({
    url: z.string().trim().url()
});

export const redirectParamsSchema = z.object({
    code: shortCodeSchema
});

export const analyticsParamsSchema = z.object({
    shortCode: shortCodeSchema
});

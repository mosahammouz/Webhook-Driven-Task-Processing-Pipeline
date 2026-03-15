import rateLimit from "express-rate-limit";
import { Request } from "express";

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 4,
  keyGenerator : (req: Request) => {
    return req.params.pipelineId as string; // always a string
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests to this pipeline, try again later."
});
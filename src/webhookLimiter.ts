import rateLimit from "express-rate-limit";
import { Request } from "express";

export const webhookLimiter = rateLimit({  // as a middleware  ratelimit() is a func takes an obj as a param
  windowMs: 60 * 1000, // 1 minute
  max: 4, // no. of requests
  keyGenerator : (req: Request) => {
    return req.params.pipelineId as string; // always a string
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests to this pipeline, try again later."
});
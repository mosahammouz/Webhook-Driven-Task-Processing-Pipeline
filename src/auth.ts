import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
const API_KEY = process.env.API_KEY as string;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
   console.log("authMiddleware starts working ...");
  const key = req.headers["x-api-key"] as string;
  if (!key) return res.status(401).json({ error: "API_KEY missing!" });
  if (key !== API_KEY) return res.status(403).json({ error: "Invalid API_KEY!" });
   console.log("next() will be called now ");
  next();
}

export function verifyWebhookSignature(payloadStr: string , signature: string): boolean{
   const secret = process.env.WEBHOOK_SECRET! as string;
   const expectedSignature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
   return expectedSignature === signature;   // same payloadStr + same secret => same hex
}
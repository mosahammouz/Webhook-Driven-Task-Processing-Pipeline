import { Request, Response, NextFunction } from "express";
const API_KEY = process.env.API_KEY as string;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
   console.log("authMiddleware starts working ...");
  const key = req.headers["x-api-key"] as string;
  if (!key) return res.status(401).json({ error: "API_KEY missing!" });
  if (key !== API_KEY) return res.status(403).json({ error: "Invalid API_KEY!" });
   console.log("next() will be called now ");
  next();
}
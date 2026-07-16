import { NextFunction, Request, Response } from "express";
import webTokens, { JwtPayload } from "jsonwebtoken";

const { verify } = webTokens;

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Missing token" });
    return;
  }

  verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.user = user;
    next();
  });
}

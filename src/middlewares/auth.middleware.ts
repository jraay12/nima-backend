import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type DecodedToken = {
  userId: string;
  email: string;
};

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedToken;

    req.user = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
}
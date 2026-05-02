import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const JWT_SECRET = process.env.JWT_SECRET as string;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    res.status(500).json({
      message: "Internal server error: JWT_SECRET not configured",
    });
    return;
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Unauthorized: No token provided",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };

    if (!decoded || !decoded.adminId) {
      res.status(401).json({
        message: "Unauthorized: Invalid token!",
      });
      return;
    }

    req.adminId = decoded.adminId;
    req.role = "admin";

    next();
    return;
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
};

export default adminAuthMiddleware;

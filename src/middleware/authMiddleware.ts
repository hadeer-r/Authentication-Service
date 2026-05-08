import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  role: string;
}

const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {

  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ message: "Not authorized. No token found." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;


    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized. Token is invalid." });
  }
};

export default protect;

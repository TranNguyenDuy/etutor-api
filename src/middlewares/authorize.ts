import { Roles } from "../interfaces/roles";
import { Request, Response, NextFunction } from "express";
import { JWT } from "../utils/jwt";

export const authorize = (...roles: Roles[]) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { access_token } = req.cookies;
  let user;

  try {
    user = JWT.decode(access_token);
    res.locals.user = user;
  } catch (error) {
    return res.status(401).json({
      error_message: "Unauthorized",
    });
  }

  if (!user)
    return res.status(401).json({
      error_message: "Unauthorized",
    });

  if (!roles || !roles.length) return next();

  const matchedRole = roles.find(role => user.role === role);

  if (!matchedRole)
    return res.status(403).json({
      error_message: "You don't have access to this resource",
    });

  next();
};

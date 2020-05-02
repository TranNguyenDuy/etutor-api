import { NextFunction, Request, Response } from "express";

export const requirePayload = (from: "body" | "query", ...fields: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = req[from];
  if (!payload)
    return res.status(400).json({
      error_message: `Missing ${from}`,
    });

  const missingFields: string[] = [];
  fields.forEach(field => {
    const fieldValue = payload[field];
    if (fieldValue === undefined) missingFields.push(field);
  });
  if (missingFields.length)
    return res.status(400).json({
      error_message: `Missing fields ${missingFields.join(", ")}`,
    });
  next();
};

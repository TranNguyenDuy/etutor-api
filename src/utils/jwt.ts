import { sign, decode, verify } from "jsonwebtoken";
import { AppConfigs } from "../configs";

export const JWT = {
  sign: (data: any, expiresIn?: string | number) =>
    sign(data, AppConfigs.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn,
    }),
  decode: (token: string) => verify(token, AppConfigs.JWT_SECRET),
};

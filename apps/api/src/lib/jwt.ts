import jwt from "jsonwebtoken";

const envSecret = process.env.JWT_SECRET;
if (!envSecret) throw new Error("JWT_SECRET não definido no .env");
const SECRET: string = envSecret;

export interface AuthTokenPayload {
  adminId: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}

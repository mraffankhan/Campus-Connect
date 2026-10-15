import jwt from "jsonwebtoken";
import type { QRTokenPayload } from "./generate";

const QR_JWT_SECRET = process.env.QR_JWT_SECRET || "default-campus-connect-secret-change-in-prod-32chars";

export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = jwt.verify(token, QR_JWT_SECRET) as QRTokenPayload;
    if (!decoded.eventId || !decoded.userId) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

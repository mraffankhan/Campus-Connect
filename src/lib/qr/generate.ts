import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const QR_JWT_SECRET = process.env.QR_JWT_SECRET || "default-campus-connect-secret-change-in-prod-32chars";

export interface QRTokenPayload {
  eventId: string;
  userId: string;
  registrationId: string;
}

/**
 * Signs a time-limited QR token valid for the duration of the event
 */
export function generateQRToken(payload: QRTokenPayload, expiresInSeconds: number = 86400): string {
  return jwt.sign(payload, QR_JWT_SECRET, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Generates a base64 Data URL for a QR code string
 */
export async function generateQRCodeDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 320,
    margin: 2,
    color: {
      dark: "#1e1b4b", // deep indigo
      light: "#ffffff",
    },
  });
}

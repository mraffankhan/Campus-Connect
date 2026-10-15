import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateQRToken, type QRTokenPayload } from "../generate";
import { verifyQRToken } from "../verify";

describe("Signed QR Attendance Tokens", () => {
  it("should generate and successfully verify a signed token", () => {
    const payload: QRTokenPayload = {
      eventId: "event-123",
      userId: "user-456",
      registrationId: "reg-789",
    };

    const token = generateQRToken(payload, 3600);
    assert.ok(typeof token === "string");

    const verified = verifyQRToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.eventId, "event-123");
    assert.strictEqual(verified?.userId, "user-456");
    assert.strictEqual(verified?.registrationId, "reg-789");
  });

  it("should reject tampered or corrupted tokens", () => {
    const payload: QRTokenPayload = {
      eventId: "event-123",
      userId: "user-456",
      registrationId: "reg-789",
    };

    const token = generateQRToken(payload, 3600);
    const tamperedToken = token.slice(0, -6) + "xxxxxx";

    const verified = verifyQRToken(tamperedToken);
    assert.strictEqual(verified, null);
  });
});

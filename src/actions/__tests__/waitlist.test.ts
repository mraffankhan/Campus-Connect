import { describe, it } from "node:test";
import assert from "node:assert/strict";

interface MockRegistration {
  id: string;
  userId: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  registeredAt: Date;
}

class WaitlistManager {
  private registrations: MockRegistration[] = [];
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  register(userId: string): { status: "CONFIRMED" | "WAITLISTED" } {
    const confirmedCount = this.registrations.filter((r) => r.status === "CONFIRMED").length;
    const status = confirmedCount < this.capacity ? "CONFIRMED" : "WAITLISTED";

    this.registrations.push({
      id: `reg-${Date.now()}-${userId}`,
      userId,
      status,
      registeredAt: new Date(),
    });

    return { status };
  }

  cancel(userId: string): { promotedUserId: string | null } {
    const reg = this.registrations.find((r) => r.userId === userId && r.status === "CONFIRMED");
    if (!reg) return { promotedUserId: null };

    reg.status = "CANCELLED";

    // Find oldest waitlisted
    const waitlisted = this.registrations
      .filter((r) => r.status === "WAITLISTED")
      .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime());

    if (waitlisted.length > 0) {
      const nextInLine = waitlisted[0];
      nextInLine.status = "CONFIRMED";
      return { promotedUserId: nextInLine.userId };
    }

    return { promotedUserId: null };
  }

  getConfirmed(): MockRegistration[] {
    return this.registrations.filter((r) => r.status === "CONFIRMED");
  }

  getWaitlist(): MockRegistration[] {
    return this.registrations.filter((r) => r.status === "WAITLISTED");
  }
}

describe("Event Capacity & Automatic Waitlist Logic", () => {
  it("should confirm registrations up to event capacity", () => {
    const manager = new WaitlistManager(2); // capacity of 2

    const res1 = manager.register("user-1");
    const res2 = manager.register("user-2");

    assert.strictEqual(res1.status, "CONFIRMED");
    assert.strictEqual(res2.status, "CONFIRMED");
    assert.strictEqual(manager.getConfirmed().length, 2);
  });

  it("should place subsequent registrations on the waitlist when full", () => {
    const manager = new WaitlistManager(2);

    manager.register("user-1");
    manager.register("user-2");
    const res3 = manager.register("user-3");
    const res4 = manager.register("user-4");

    assert.strictEqual(res3.status, "WAITLISTED");
    assert.strictEqual(res4.status, "WAITLISTED");
    assert.strictEqual(manager.getConfirmed().length, 2);
    assert.strictEqual(manager.getWaitlist().length, 2);
  });

  it("should automatically promote the oldest waitlisted user when a confirmed student cancels", () => {
    const manager = new WaitlistManager(2);

    manager.register("user-1"); // Confirmed 1
    manager.register("user-2"); // Confirmed 2
    manager.register("user-3"); // Waitlist 1 (first in line)
    manager.register("user-4"); // Waitlist 2 (second in line)

    // User-1 cancels
    const result = manager.cancel("user-1");

    // Expect user-3 to be promoted
    assert.strictEqual(result.promotedUserId, "user-3");
    assert.strictEqual(manager.getConfirmed().length, 2);
    assert.strictEqual(manager.getConfirmed().some((r) => r.userId === "user-3"), true);
    assert.strictEqual(manager.getWaitlist().length, 1);
    assert.strictEqual(manager.getWaitlist()[0].userId, "user-4");
  });
});

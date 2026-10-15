"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerForEvent, cancelRegistration } from "@/actions/registrations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, QrCode, CheckCircle2, Clock, XCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { RegistrationStatus } from "@prisma/client";

interface RegistrationButtonProps {
  eventId: string;
  registration?: {
    id: string;
    status: RegistrationStatus;
  } | null;
  isPast: boolean;
  isCancelled: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
}

export function RegistrationButton({
  eventId,
  registration,
  isPast,
  isCancelled,
  isFull,
  deadlinePassed,
}: RegistrationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerForEvent(eventId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }

      if (res.data.status === "CONFIRMED") {
        toast.success("Registration confirmed! Access your QR pass.");
      } else {
        toast.info("Event is currently full. You have been added to the waitlist.");
      }
      router.refresh();
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your event registration?")) return;

    setLoading(true);
    try {
      const res = await cancelRegistration(eventId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Registration cancelled.");
      router.refresh();
    } catch {
      toast.error("Failed to cancel registration");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled size="sm" variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (isCancelled) {
    return (
      <Button disabled variant="destructive" size="sm">
        Event Cancelled
      </Button>
    );
  }

  if (isPast) {
    return (
      <Button disabled variant="outline" size="sm">
        Event Concluded
      </Button>
    );
  }

  // User has active CONFIRMED registration
  if (registration && registration.status === "CONFIRMED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/events/${eventId}/qr`}
          className={buttonVariants({
            size: "sm",
            className: "gap-1.5 shadow-sm bg-primary",
          })}
        >
          <QrCode className="h-4 w-4" />
          <span>My QR Ticket</span>
        </Link>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          Cancel Registration
        </Button>
      </div>
    );
  }

  // User is WAITLISTED
  if (registration && registration.status === "WAITLISTED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" disabled className="gap-1.5 cursor-default text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span>On Waitlist</span>
        </Button>
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Leave Waitlist
        </Button>
      </div>
    );
  }

  if (deadlinePassed) {
    return (
      <Button disabled variant="outline" size="sm">
        Registration Closed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      size="sm"
      className={isFull ? "bg-amber-600 hover:bg-amber-700" : ""}
    >
      <UserPlus className="mr-1.5 h-4 w-4" />
      {isFull ? "Join Waitlist" : "Register Now"}
    </Button>
  );
}

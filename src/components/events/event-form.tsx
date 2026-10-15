"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, type CreateEventInput } from "@/schemas/event";
import { createEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface EventFormProps {
  clubId: string;
  clubName: string;
  clubSlug: string;
}

export function EventForm({ clubId, clubName, clubSlug }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default dates: tomorrow 10am to 12pm
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const defaultStart = tomorrow.toISOString().slice(0, 16);
  tomorrow.setHours(12, 0, 0, 0);
  const defaultEnd = tomorrow.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      clubId,
      title: "",
      description: "",
      venue: "",
      startsAt: defaultStart,
      endsAt: defaultEnd,
      capacity: null,
      registrationDeadline: null,
      isMembersOnly: false,
      bannerUrl: "",
      status: "PUBLISHED",
    },
  });

  const isMembersOnly = watch("isMembersOnly");

  const onSubmit = async (values: CreateEventInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createEvent(values);
      if (!res.success) {
        setError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Event created and published!");
      router.push(`/events/${res.data.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred while creating the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/80 shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
          <Calendar className="h-4 w-4" />
          <span>Hosting under {clubName}</span>
        </div>
        <CardTitle className="text-2xl font-bold">Create Campus Event</CardTitle>
        <CardDescription>
          Publish workshops, competitions, seminars, and club gatherings for students.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="e.g. Annual Hackathon 2026: AI Frontiers"
              disabled={loading}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue / Location</Label>
            <Input
              id="venue"
              placeholder="e.g. Main Auditorium / Seminar Hall B"
              disabled={loading}
              {...register("venue")}
            />
            {errors.venue && (
              <p className="text-xs text-destructive">{errors.venue.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts At</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                disabled={loading}
                {...register("startsAt")}
              />
              {errors.startsAt && (
                <p className="text-xs text-destructive">{errors.startsAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endsAt">Ends At</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                disabled={loading}
                {...register("endsAt")}
              />
              {errors.endsAt && (
                <p className="text-xs text-destructive">{errors.endsAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Leave blank for unlimited"
                disabled={loading}
                {...register("capacity", {
                  setValueAs: (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
                })}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline (Optional)</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                disabled={loading}
                {...register("registrationDeadline")}
              />
              {errors.registrationDeadline && (
                <p className="text-xs text-destructive">{errors.registrationDeadline.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Details & Agenda</Label>
            <Textarea
              id="description"
              placeholder="Provide event overview, prerequisites, rules, schedule, and speaker info..."
              rows={5}
              disabled={loading}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerUrl">Banner Image URL (Optional)</Label>
            <Input
              id="bannerUrl"
              placeholder="https://example.com/banner.jpg"
              type="url"
              disabled={loading}
              {...register("bannerUrl")}
            />
            {errors.bannerUrl && (
              <p className="text-xs text-destructive">{errors.bannerUrl.message}</p>
            )}
          </div>

          {/* Members Only toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <input
              type="checkbox"
              id="isMembersOnly"
              checked={isMembersOnly}
              onChange={(e) => setValue("isMembersOnly", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isMembersOnly" className="text-sm font-medium cursor-pointer">
              Restrict to Approved Club Members Only
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing Event...
              </>
            ) : (
              "Publish Event"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

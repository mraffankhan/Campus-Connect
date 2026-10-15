import { z } from "zod";

export const createEventSchema = z
  .object({
    clubId: z.string().min(1, "Club selection is required"),
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be under 120 characters"),
    description: z
      .string()
      .min(10, "Please provide a description of at least 10 characters")
      .max(2500, "Description must be under 2500 characters"),
    venue: z
      .string()
      .min(2, "Venue / Room location is required")
      .max(100, "Venue must be under 100 characters"),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
    capacity: z.number().int().positive().nullable().optional(),
    registrationDeadline: z.string().optional().nullable(),
    isMembersOnly: z.boolean(),
    bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED"]),
  })
  .refine(
    (data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "End time must be after the start time",
      path: ["endsAt"],
    }
  );

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

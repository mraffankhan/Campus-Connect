import { z } from "zod";

export const createAnnouncementSchema = z.object({
  clubId: z.string().nullable().optional(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters"),
  body: z
    .string()
    .min(10, "Announcement body must be at least 10 characters")
    .max(3000, "Announcement body must be under 3000 characters"),
  pinned: z.boolean(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

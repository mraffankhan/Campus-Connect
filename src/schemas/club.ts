import { z } from "zod";
import { CLUB_CATEGORIES } from "@/lib/constants";

export const createClubSchema = z.object({
  name: z
    .string()
    .min(3, "Club name must be at least 3 characters")
    .max(80, "Club name must be less than 80 characters"),
  description: z
    .string()
    .min(10, "Please provide a description of at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.enum(CLUB_CATEGORIES),
  logoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export const updateClubSchema = createClubSchema.partial();

export const updateMemberRoleSchema = z.object({
  role: z.enum(["MEMBER", "COORDINATOR", "LEAD"]),
});

export const updateMemberStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;

"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  signupSchema,
  completeProfileSchema,
  type LoginInput,
  type SignupInput,
  type CompleteProfileInput,
} from "@/schemas/auth";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "";

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

export async function signup(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  // Validate email domain if configured
  if (ALLOWED_EMAIL_DOMAIN) {
    const emailDomain = parsed.data.email.split("@")[1];
    if (emailDomain !== ALLOWED_EMAIL_DOMAIN) {
      return {
        success: false,
        error: `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
      };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: "STUDENT",
        profile_complete: false,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Create user record in Prisma
  if (data.user) {
    try {
      await prisma.user.create({
        data: {
          supabaseId: data.user.id,
          email: parsed.data.email,
          name: parsed.data.name,
          role: "STUDENT",
        },
      });
    } catch {
      // User might already exist (e.g., from OAuth callback)
    }
  }

  return { success: true, data: undefined };
}

export async function completeProfile(
  input: CompleteProfileInput
): Promise<ActionResult> {
  const parsed = completeProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return { success: false, error: "Not authenticated" };
  }

  // Update Prisma user
  await prisma.user.update({
    where: { supabaseId: supabaseUser.id },
    data: {
      department: parsed.data.department,
      year: parsed.data.year,
    },
  });

  // Update Supabase user metadata
  await supabase.auth.updateUser({
    data: {
      profile_complete: true,
      department: parsed.data.department,
      year: parsed.data.year,
    },
  });

  return { success: true, data: undefined };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

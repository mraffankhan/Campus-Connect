"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "";

/**
 * Switch the active persona seamlessly in demo mode.
 */
export async function switchDemoUser(userId: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: "Demo persona not found" };
  }

  const cookieStore = await cookies();
  cookieStore.set("campus_connect_demo_user", user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
  cookieStore.set("campus_connect_demo_role", user.role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  cookieStore.set("campus_connect_demo_name", user.name, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  // 1. Check if email matches any demo users (Mock mode instant login)
  const existingMockUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingMockUser) {
    const cookieStore = await cookies();
    cookieStore.set("campus_connect_demo_user", existingMockUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("campus_connect_demo_role", existingMockUser.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("campus_connect_demo_name", existingMockUser.name, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  }

  // 2. Fall back to Supabase if live credentials configured
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch {
    return {
      success: false,
      error: "User not found. Please click one of the quick demo personas below.",
    };
  }
}

export async function signup(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  if (ALLOWED_EMAIL_DOMAIN) {
    const emailDomain = parsed.data.email.split("@")[1];
    if (emailDomain !== ALLOWED_EMAIL_DOMAIN) {
      return {
        success: false,
        error: `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
      };
    }
  }

  try {
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
        // User might already exist
      }
    }
  } catch {
    // If Supabase not reachable, create in mock db directly!
    const newUser = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: "STUDENT",
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("campus_connect_demo_user", newUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("campus_connect_demo_role", newUser.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("campus_connect_demo_name", newUser.name, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
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

  try {
    const cookieStore = await cookies();
    const demoUserId = cookieStore.get("campus_connect_demo_user")?.value;
    if (demoUserId) {
      await prisma.user.update({
        where: { id: demoUserId },
        data: {
          department: parsed.data.department,
          year: parsed.data.year,
        },
      });
      return { success: true, data: undefined };
    }
  } catch {
    // ignore
  }

  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      await prisma.user.update({
        where: { supabaseId: supabaseUser.id },
        data: {
          department: parsed.data.department,
          year: parsed.data.year,
        },
      });

      await supabase.auth.updateUser({
        data: {
          profile_complete: true,
          department: parsed.data.department,
          year: parsed.data.year,
        },
      });
      return { success: true, data: undefined };
    }
  } catch {
    // ignore
  }

  return { success: true, data: undefined };
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("campus_connect_demo_user");
    cookieStore.delete("campus_connect_demo_role");
    cookieStore.delete("campus_connect_demo_name");
  } catch {
    // ignore
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/login");
}

"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { registerSchema } from "@/lib/validations/auth";
import { sanitizeCallbackUrl } from "@/lib/utils";
import { ROLES, USER_STATUS } from "@/constants";
import type { FormState } from "@/types";

export async function registerAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return { message: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: ROLES.USER,
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Account created. Please sign in." };
    }
    throw error;
  }

  return { success: true };
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = formData.get("password");

  // Determine where to send the user once signed in: admins only use the
  // dashboard, everyone else lands on the storefront.
  await connectToDatabase();
  const account = await User.findOne({ email }).select("role status").lean();

  if (account?.status === USER_STATUS.SUSPENDED) {
    return {
      message: "Your account has been suspended. Please contact support.",
      helpHref: "/support",
      helpLabel: "Contact support",
    };
  }

  const redirectTo =
    account?.role === ROLES.ADMIN
      ? "/admin"
      : (sanitizeCallbackUrl(formData.get("callbackUrl")) ?? "/");

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { message: "Invalid email or password." };
      }
      return { message: "Something went wrong. Please try again." };
    }
    throw error;
  }

  return null;
}

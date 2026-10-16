"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { requireAdmin, requireUser } from "@/lib/dal";
import {
  ROLES,
  USER_STATUS,
  USER_STATUS_VALUES,
  type Role,
  type UserStatus,
} from "@/constants";
import {
  changePasswordSchema,
  updateUserStatusSchema,
  userProfileSchema,
} from "@/lib/validations/user";
import type { FormState } from "@/types";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<FormState> {
  const currentUser = await requireAdmin();

  if (!OBJECT_ID.test(userId)) {
    return { message: "Invalid user." };
  }

  if (currentUser.id === userId) {
    return { message: "You cannot change your own role." };
  }

  if (!Object.values(ROLES).includes(role)) {
    return { message: "Invalid role." };
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(userId, { role });

  if (!updated) {
    return { message: "User not found." };
  }

  revalidatePath("/admin/users");

  return { success: true, message: "User role updated." };
}

export async function updateUserProfileAction(
  userId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  if (!OBJECT_ID.test(userId)) {
    return { message: "Invalid user." };
  }

  const parsed = userProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email } = parsed.data;

  await connectToDatabase();

  const existing = await User.findOne({ email, _id: { $ne: userId } }).lean();
  if (existing) {
    return { errors: { email: ["This email is already in use."] } };
  }

  const updated = await User.findByIdAndUpdate(userId, { name, email });
  if (!updated) {
    return { message: "User not found." };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);

  return { success: true, message: "User updated." };
}

export async function updateUserStatusAction(
  userId: string,
  status: UserStatus,
): Promise<FormState> {
  const currentUser = await requireAdmin();

  if (!OBJECT_ID.test(userId)) {
    return { message: "Invalid user." };
  }

  if (currentUser.id === userId) {
    return { message: "You cannot change your own status." };
  }

  const parsed = updateUserStatusSchema.safeParse({ status });
  if (!parsed.success || !USER_STATUS_VALUES.includes(status)) {
    return { message: "Invalid status." };
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(userId, { status });
  if (!updated) {
    return { message: "User not found." };
  }

  revalidatePath("/admin/users");

  return {
    success: true,
    message:
      status === USER_STATUS.SUSPENDED
        ? "User suspended."
        : "User activated.",
  };
}

export async function deleteUserAction(userId: string): Promise<FormState> {
  const currentUser = await requireAdmin();

  if (!OBJECT_ID.test(userId)) {
    return { message: "Invalid user." };
  }

  if (currentUser.id === userId) {
    return { message: "You cannot delete your own account." };
  }

  await connectToDatabase();
  const deleted = await User.findByIdAndDelete(userId);

  if (!deleted) {
    return { message: "User not found." };
  }

  revalidatePath("/admin/users");

  return { success: true, message: "User deleted." };
}

export async function changePasswordAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const sessionUser = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { currentPassword, newPassword } = parsed.data;

  await connectToDatabase();

  const user = await User.findById(sessionUser.id).select("+password");
  if (!user || !user.password) {
    return { message: "User account not found." };
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    return {
      errors: {
        currentPassword: ["Incorrect current password."],
      },
    };
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return {
      errors: {
        newPassword: ["New password must be different from current password."],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return { success: true, message: "Password updated successfully." };
}


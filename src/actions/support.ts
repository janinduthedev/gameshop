"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { SupportMessage } from "@/models";
import { getSession, requireAdmin } from "@/lib/dal";
import {
  SUPPORT_STATUS,
  SUPPORT_STATUS_VALUES,
  type SupportStatus,
} from "@/constants";
import {
  supportMessageSchema,
  updateSupportStatusSchema,
} from "@/lib/validations/support";
import type { FormState } from "@/types";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function createSupportMessageAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = supportMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();

  await connectToDatabase();
  await SupportMessage.create({
    ...parsed.data,
    user: session?.user?.id ?? null,
    status: SUPPORT_STATUS.OPEN,
  });

  revalidatePath("/admin/support");

  return {
    success: true,
    message:
      "Thanks for reaching out! Our team will reply to you by email shortly.",
  };
}

export async function updateSupportStatusAction(
  messageId: string,
  status: SupportStatus,
): Promise<FormState> {
  await requireAdmin();

  if (!OBJECT_ID.test(messageId)) {
    return { message: "Invalid message." };
  }

  const parsed = updateSupportStatusSchema.safeParse({ status });
  if (!parsed.success || !SUPPORT_STATUS_VALUES.includes(status)) {
    return { message: "Invalid status." };
  }

  await connectToDatabase();
  const updated = await SupportMessage.findByIdAndUpdate(messageId, { status });
  if (!updated) {
    return { message: "Message not found." };
  }

  revalidatePath("/admin/support");

  return {
    success: true,
    message:
      status === SUPPORT_STATUS.RESOLVED
        ? "Marked as resolved."
        : "Message reopened.",
  };
}

export async function deleteSupportMessageAction(
  messageId: string,
): Promise<FormState> {
  await requireAdmin();

  if (!OBJECT_ID.test(messageId)) {
    return { message: "Invalid message." };
  }

  await connectToDatabase();
  const deleted = await SupportMessage.findByIdAndDelete(messageId);
  if (!deleted) {
    return { message: "Message not found." };
  }

  revalidatePath("/admin/support");

  return { success: true, message: "Message deleted." };
}

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLES } from "@/constants";

/**
 * Data Access Layer (DAL).
 *
 * Centralises session reads and authorization so that every data request
 * goes through the same gate. `cache` dedupes the call within a render pass.
 */
export const getSession = cache(async () => {
  return auth();
});

/** Returns the signed-in user or redirects to the login page. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/** Ensures the current user is an admin, otherwise redirects. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== ROLES.ADMIN) {
    redirect("/");
  }
  return session.user;
}

/** Convenience boolean used to render role-specific UI. */
export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === ROLES.ADMIN;
}

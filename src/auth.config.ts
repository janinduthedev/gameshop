import type { NextAuthConfig } from "next-auth";
import { ROLES, type Role } from "@/constants";

/**
 * Edge-safe part of the Auth.js config.
 * It contains NO database or bcrypt imports so it can run inside the proxy
 * (middleware) layer. The full config lives in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      const isAdminRoute = pathname.startsWith("/admin");
      const isProtectedRoute =
        isAdminRoute ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/orders");

      // Admins only get the dashboard — bounce them off the storefront.
      if (isLoggedIn && role === ROLES.ADMIN && !isAdminRoute) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (role !== ROLES.ADMIN) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

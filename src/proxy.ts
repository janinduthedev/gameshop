import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 renamed Middleware to Proxy.
 * We only use the edge-safe config here for optimistic, cookie-based checks.
 * Real authorization also happens in the Data Access Layer (`lib/dal.ts`)
 * and inside every Server Action.
 */
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

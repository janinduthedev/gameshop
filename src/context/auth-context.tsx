"use client";

import { createContext, useContext, type ReactNode } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
};

/* Guests default to false so a component rendered outside the provider can
   never let a signed-out user through. */
const AuthContext = createContext<AuthContextValue>({ isAuthenticated: false });

export function AuthProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  return (
    <AuthContext value={{ isAuthenticated }}>{children}</AuthContext>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

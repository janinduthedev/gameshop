import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/dal";
import { sanitizeCallbackUrl } from "@/lib/utils";
import { ROLES } from "@/constants";

export const metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const session = await getSession();
  if (session?.user) {
    redirect(session.user.role === ROLES.ADMIN ? "/admin" : "/");
  }

  return <LoginForm callbackUrl={sanitizeCallbackUrl(callbackUrl)} />;
}

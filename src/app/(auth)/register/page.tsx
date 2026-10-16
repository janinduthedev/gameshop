import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/dal";
import { ROLES } from "@/constants";

export const metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.user) {
    redirect(session.user.role === ROLES.ADMIN ? "/admin" : "/");
  }

  return <RegisterForm />;
}

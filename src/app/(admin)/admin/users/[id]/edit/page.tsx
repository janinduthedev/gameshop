import { notFound } from "next/navigation";
import Link from "next/link";
import { UserForm } from "@/components/admin/user-form";
import { updateUserProfileAction } from "@/actions/user";
import { getUserById } from "@/lib/queries";

export const metadata = { title: "Edit user" };

type EditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to users
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Edit user</h1>

      <div className="max-w-2xl">
        <UserForm
          action={updateUserProfileAction.bind(null, id)}
          initial={{ name: user.name, email: user.email }}
        />
      </div>
    </div>
  );
}

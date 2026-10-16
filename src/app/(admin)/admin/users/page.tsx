import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/admin/action-button";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import {
  deleteUserAction,
  updateUserStatusAction,
} from "@/actions/user";
import { requireAdmin } from "@/lib/dal";
import { getUsers } from "@/lib/queries";
import { USER_STATUS, USER_STATUS_LABELS, type Role } from "@/constants";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const currentAdmin = await requireAdmin();
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground">
        {users.length} registered account(s).
      </p>

      <div className="mt-6 rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentAdmin.id;
              const isSuspended = user.status === "suspended";
              const nextStatus = isSuspended
                ? USER_STATUS.ACTIVE
                : USER_STATUS.SUSPENDED;

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <UserRoleSelect
                      userId={user.id}
                      role={user.role as Role}
                      disabled={isSelf}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={isSuspended ? "destructive" : "success"}>
                      {isSuspended
                        ? USER_STATUS_LABELS[USER_STATUS.SUSPENDED]
                        : USER_STATUS_LABELS[USER_STATUS.ACTIVE]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!isSelf && (
                        <>
                          <ActionButton
                            action={updateUserStatusAction.bind(
                              null,
                              user.id,
                              nextStatus,
                            )}
                            confirmMessage={
                              isSuspended
                                ? undefined
                                : `Suspend "${user.name}"? They will not be able to sign in.`
                            }
                            successMessage={
                              isSuspended ? "User activated" : "User suspended"
                            }
                            className="h-10 rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isSuspended ? "Activate" : "Suspend"}
                          </ActionButton>
                          <ActionButton
                            action={deleteUserAction.bind(null, user.id)}
                            confirmMessage={`Delete user "${user.name}"?`}
                            successMessage="User deleted"
                            className="flex h-10 w-10 items-center justify-center rounded-md text-destructive transition-colors hover:bg-accent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

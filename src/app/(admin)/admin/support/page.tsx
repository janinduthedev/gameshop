import { MailOpen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import {
  deleteSupportMessageAction,
  updateSupportStatusAction,
} from "@/actions/support";
import { requireAdmin } from "@/lib/dal";
import { getSupportMessages } from "@/lib/queries";
import { SUPPORT_STATUS, SUPPORT_STATUS_LABELS } from "@/constants";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Support" };

export default async function AdminSupportPage() {
  await requireAdmin();
  const messages = await getSupportMessages();
  const openCount = messages.filter((m) => m.status === SUPPORT_STATUS.OPEN).length;

  return (
    <div>
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="text-muted-foreground">
        {messages.length} message(s) · {openCount} open.
      </p>

      {messages.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-card py-16 text-center text-muted-foreground">
          No support messages yet.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {messages.map((message) => {
            const isResolved = message.status === SUPPORT_STATUS.RESOLVED;
            const nextStatus = isResolved
              ? SUPPORT_STATUS.OPEN
              : SUPPORT_STATUS.RESOLVED;

            return (
              <div key={message.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{message.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {message.name} · {message.email} ·{" "}
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <Badge variant={isResolved ? "success" : "secondary"}>
                    {SUPPORT_STATUS_LABELS[message.status as "open" | "resolved"]}
                  </Badge>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {message.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                  <ActionButton
                    action={updateSupportStatusAction.bind(
                      null,
                      message.id,
                      nextStatus,
                    )}
                    successMessage={
                      isResolved ? "Message reopened" : "Marked as resolved"
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <MailOpen className="h-3.5 w-3.5" />
                    {isResolved ? "Reopen" : "Mark resolved"}
                  </ActionButton>
                  <ActionButton
                    action={deleteSupportMessageAction.bind(null, message.id)}
                    confirmMessage="Delete this support message?"
                    successMessage="Message deleted"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-destructive transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </ActionButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

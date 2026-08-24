"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, MessageCircle, X } from "lucide-react";
import { logReminder } from "@/app/admin/reminders/actions";
// Formatting only - importing the query module here would pull
// next/headers into the client bundle.
import {
  reminderContext,
  reminderHeadline,
  reminderWhatsappLink,
  type Reminder,
} from "@/lib/admin/reminder-format";
import { cn } from "@/lib/utils/cn";

/**
 * §13.4 - one reminder, with the WhatsApp handoff and the three
 * outcomes.
 *
 * The message opens in WhatsApp pre-filled but fully editable, which the
 * plan is emphatic about: in a town this size an obviously automated
 * message does real damage, and this only works because it reads as the
 * baker having remembered.
 */
export function ReminderCard({
  reminder,
  compact = false,
}: {
  reminder: Reminder;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(reminder.logStatus);

  function mark(next: "contacted" | "ordered" | "dismissed") {
    setStatus(next);
    startTransition(async () => {
      const result = await logReminder({
        orderId: reminder.orderId,
        customerId: reminder.customerId,
        reminderDate: reminder.upcomingDate,
        occasionDate: reminder.occasionDate,
        status: next,
      });
      if (!result.ok) {
        setStatus(reminder.logStatus);
        toast.error(result.message);
      } else {
        toast.success(
          next === "ordered"
            ? "Marked as ordered"
            : next === "contacted"
              ? "Marked as contacted"
              : "Dismissed for this year"
        );
      }
    });
  }

  return (
    <article
      className={cn(
        "rounded-md border border-cream-200 bg-cream-50 p-3",
        status && "opacity-70",
        pending && "opacity-60"
      )}
    >
      <p className="text-sm font-medium text-ink">{reminderHeadline(reminder)}</p>
      <p className="mt-0.5 text-sm text-ink/70">{reminderContext(reminder)}</p>

      {status ? (
        <p className="mt-2 inline-flex items-center rounded-sm bg-cream-200 px-2 py-0.5 text-xs text-ink/70">
          {status === "ordered"
            ? "Ordered again"
            : status === "contacted"
              ? "Contacted"
              : "Dismissed this year"}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={reminderWhatsappLink(reminder)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => mark("contacted")}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-whatsapp px-3 text-sm font-medium text-[#04301A] sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </a>

          {!compact ? (
            <>
              <button
                type="button"
                onClick={() => mark("ordered")}
                className="flex min-h-11 items-center gap-1.5 rounded-md border border-cream-200 px-3 text-sm text-ink"
              >
                <Check className="h-4 w-4 text-pista" />
                They ordered
              </button>
              <button
                type="button"
                onClick={() => mark("dismissed")}
                aria-label="Dismiss this reminder"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 text-ink/50"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      )}

      {!compact ? (
        <p className="mt-2 text-xs text-ink/45">
          The message opens in WhatsApp so you can change the wording before sending.
        </p>
      ) : null}
    </article>
  );
}

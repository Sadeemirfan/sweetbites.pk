"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Image as ImageIcon, MessageCircle } from "lucide-react";
import { updateCustomRequest } from "@/app/admin/actions";
import { privateFileUrl } from "@/lib/admin/private-file";
import { formatPrice, formatShortDate } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";

type Request = {
  id: string;
  name: string | null;
  phone: string | null;
  occasion: string | null;
  tiers: number | null;
  weightKg: number | null;
  flavor: string | null;
  theme: string | null;
  referenceImages: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  requiredDate: string | null;
  status: string;
  quotedPrice: number | null;
  adminReply: string | null;
  createdAt: string;
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "converted", label: "Converted" },
];

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";

export function RequestsInbox({ requests }: { requests: Request[] }) {
  const [items, setItems] = useState(requests);
  const [pending, startTransition] = useTransition();

  function update(id: string, fields: Partial<Request>, payload: Parameters<typeof updateCustomRequest>[1]) {
    setItems((current) =>
      current.map((request) => (request.id === id ? { ...request, ...fields } : request))
    );
    startTransition(async () => {
      const result = await updateCustomRequest(id, payload);
      if (result.ok) toast.success("Saved");
      else toast.error(result.message);
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
        No custom cake requests yet. They arrive here from the website form.
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", pending && "opacity-90")}>
      {items.map((request) => (
        <li key={request.id} className="rounded-md border border-cream-200 bg-cream-50 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-ink">{request.name || "Unnamed"}</p>
              <p className="text-xs text-ink/55">
                {request.phone} · {formatShortDate(new Date(request.createdAt))}
              </p>
            </div>
            <select
              value={request.status}
              onChange={(event) =>
                update(request.id, { status: event.target.value }, { status: event.target.value })
              }
              className="h-9 rounded-md border border-cream-200 bg-cream-50 px-2 text-sm text-ink"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
            {request.occasion ? <span>Occasion: {request.occasion}</span> : null}
            {request.tiers ? <span>{request.tiers} tier</span> : null}
            {request.weightKg ? <span>{request.weightKg} kg</span> : null}
            {request.flavor ? <span>{request.flavor}</span> : null}
            {request.requiredDate ? <span>Needed {request.requiredDate}</span> : null}
            {request.budgetMin || request.budgetMax ? (
              <span>
                Budget {formatPrice(request.budgetMin)}–{formatPrice(request.budgetMax)}
              </span>
            ) : null}
          </dl>

          {request.theme ? (
            <p className="mt-2 rounded-sm bg-cream-100 p-2 text-sm text-ink/80">{request.theme}</p>
          ) : null}

          {/*
            order-refs is private (admin read only), so each picture opens
            through the signed-URL route rather than being linked directly.
            The picture is usually the whole point of a custom request -
            listing bare storage paths made it unreachable.
          */}
          {request.referenceImages.length ? (
            <div className="mt-2">
              <span className="text-xs text-ink/55">
                {request.referenceImages.length} reference picture
                {request.referenceImages.length === 1 ? "" : "s"}
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {request.referenceImages.map((path, index) => (
                  <a
                    key={path}
                    href={privateFileUrl("order-refs", path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-cream-200 px-2.5 text-xs text-rosewood hover:underline"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Picture {index + 1}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 grid gap-2 border-t border-cream-200 pt-3 sm:grid-cols-[10rem_1fr]">
            <input
              type="number"
              inputMode="numeric"
              defaultValue={request.quotedPrice ?? ""}
              placeholder="Quote (Rs.)"
              onBlur={(event) =>
                update(
                  request.id,
                  { quotedPrice: Number(event.target.value) || null },
                  {
                    quoted_price: Number(event.target.value) || null,
                    status: request.status === "new" ? "quoted" : request.status,
                  }
                )
              }
              className={field}
            />
            <input
              defaultValue={request.adminReply ?? ""}
              placeholder="Reply / note"
              onBlur={(event) =>
                update(
                  request.id,
                  { adminReply: event.target.value || null },
                  { admin_reply: event.target.value || null }
                )
              }
              className={field}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {request.phone ? (
              <a
                href={whatsappLink(
                  `Assalam-o-Alaikum${request.name ? ` ${request.name}` : ""},\n\n` +
                    `About your custom cake request${
                      request.requiredDate ? ` for ${request.requiredDate}` : ""
                    }:\n\n` +
                    (request.quotedPrice
                      ? `We can do it for ${formatPrice(request.quotedPrice)}.\n\n`
                      : "") +
                    `- Sweet Bites Arifwala`
                ).replace(
                  /wa\.me\/\d+/,
                  `wa.me/92${request.phone.replace(/\D/g, "").replace(/^0/, "")}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 rounded-md bg-whatsapp px-3 text-sm font-medium text-[#04301A]"
              >
                <MessageCircle className="h-4 w-4" />
                Send quote
              </a>
            ) : null}

            {/* "Convert accepted requests into orders" (§12) - hands the
                details to manual entry rather than guessing at an order. */}
            <Link
              href="/admin/orders/new"
              className="flex min-h-11 items-center rounded-md border border-cream-200 bg-cream-50 px-3 text-sm text-ink"
            >
              Make an order
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

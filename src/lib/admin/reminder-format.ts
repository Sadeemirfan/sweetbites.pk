import { formatPrice } from "@/lib/utils/format";

/**
 * Reminder shape and message formatting - §13.4.
 *
 * Deliberately split from `reminders.ts`, which does the querying and
 * therefore imports `next/headers`. ReminderCard is a client component,
 * and importing the query module from it would drag server-only code
 * into the browser bundle. Everything here is pure.
 */

export const REMINDER_LEAD_DAYS = 2;

export type Reminder = {
  orderId: string;
  customerId: string | null;
  orderNumber: string | null;
  /** Who the cake was for - "Ayesha". */
  person: string | null;
  occasion: string;
  /** The original occasion date, in its original year. */
  occasionDate: string;
  /** The same month-day in the upcoming year - what we're reminding about. */
  upcomingDate: string;
  daysAway: number;
  customerName: string | null;
  phone: string;
  whatsapp: string | null;
  lastTotal: number | null;
  lastItems: string[];
  /** Null when this reminder hasn't been actioned yet this year. */
  logStatus: string | null;
  logId: string | null;
};

const OCCASION_WORD: Record<string, string> = {
  birthday: "birthday",
  anniversary: "anniversary",
  wedding: "wedding anniversary",
  graduation: "graduation",
  religious: "special occasion",
  other: "occasion",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "Ayesha's birthday is in 2 days (24 August)." */
export function reminderHeadline(reminder: Reminder): string {
  const who = reminder.person ? `${reminder.person}'s` : "A";
  const word = OCCASION_WORD[reminder.occasion] ?? "occasion";
  const when =
    reminder.daysAway === 0
      ? "is today"
      : reminder.daysAway === 1
        ? "is tomorrow"
        : `is in ${reminder.daysAway} days`;

  return `${who} ${word} ${when} (${DATE_FORMAT.format(
    new Date(`${reminder.upcomingDate}T12:00:00Z`)
  )}).`;
}

/** "Fatima Bibi ordered a 2 Pound Chocolate Fudge for it last year - Rs. 3,600." */
export function reminderContext(reminder: Reminder): string {
  const year = Number(reminder.occasionDate.slice(0, 4));
  const thisYear = new Date().getUTCFullYear();
  const when = thisYear - year === 1 ? "last year" : `in ${year}`;
  const item = reminder.lastItems[0];
  const who = reminder.customerName ?? reminder.phone;

  return [
    `${who} ordered`,
    item ? ` a ${item}` : " a cake",
    ` for it ${when}`,
    reminder.lastTotal != null ? ` - ${formatPrice(Number(reminder.lastTotal))}` : "",
    ".",
  ].join("");
}

/**
 * The pre-written message from §13.4. It opens in WhatsApp fully
 * editable, and that matters: in a town this size an obviously
 * automated message does real damage. This works precisely because it
 * reads as the baker having remembered.
 */
export function reminderMessage(reminder: Reminder): string {
  const customerFirstName = (reminder.customerName ?? "").trim().split(/\s+/)[0];
  const person = reminder.person?.trim();
  const word = OCCASION_WORD[reminder.occasion] ?? "occasion";
  const dateLabel = DATE_FORMAT.format(new Date(`${reminder.upcomingDate}T12:00:00Z`));

  // "2 Pound Chocolate Fudge" needs a noun to read as a sentence, but
  // "Box of 12 Assorted Cupcakes" already has one - only add it when the
  // descriptor doesn't name the thing itself.
  const raw = reminder.lastItems[0];
  const item =
    raw && !/cake|cupcake|box|brownie|cheesecake/i.test(raw) ? `${raw} cake` : raw;

  const lines = [
    `Assalam-o-Alaikum${customerFirstName ? ` ${customerFirstName}` : ""}!`,
    "",
    person
      ? `${person}'s ${word} is coming up on ${dateLabel}${
          item ? ` - last year we made ${person} a ${item}` : ""
        }.`
      : `Your ${word} is coming up on ${dateLabel}${item ? ` - last year we made a ${item}` : ""}.`,
    "",
    person
      ? `Would you like us to make something for ${person} again this year?`
      : "Would you like us to make something again this year?",
    "We'd need 2 days' notice.",
    "",
    "- Sweet Bites Arifwala",
  ];

  return lines.join("\n");
}

export function reminderWhatsappLink(reminder: Reminder): string {
  const digits = (reminder.whatsapp || reminder.phone).replace(/\D/g, "").replace(/^0/, "");
  return `https://wa.me/92${digits}?text=${encodeURIComponent(reminderMessage(reminder))}`;
}

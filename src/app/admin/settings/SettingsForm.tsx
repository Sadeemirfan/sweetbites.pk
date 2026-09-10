"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSetting } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { cn } from "@/lib/utils/cn";

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * §12 - "Changing site text or any fee must never require a developer."
 * Each block saves independently so a mistake in one never blocks the
 * others, and every value lands in site_settings as jsonb.
 */
export function SettingsForm({ settings }: { settings: Record<string, unknown> }) {
  const [pending, startTransition] = useTransition();

  const [headline, setHeadline] = useState(asString(settings.headline_text));
  const [menuImage, setMenuImage] = useState<string | null>(
    typeof settings.menu_image_url === "string" ? settings.menu_image_url : null
  );
  const [whatsapp, setWhatsapp] = useState(asString(settings.whatsapp_number));
  const [lateFee, setLateFee] = useState(String(settings.late_night_fee ?? 0));

  const hours = asRecord(settings.business_hours);
  const [openTime, setOpenTime] = useState(asString(hours.open, "08:00"));
  const [closeTime, setCloseTime] = useState(asString(hours.close, "22:00"));

  const socials = asRecord(settings.social_links);
  const [instagram, setInstagram] = useState(asString(socials.instagram));
  const [facebook, setFacebook] = useState(asString(socials.facebook));
  const [tiktok, setTiktok] = useState(asString(socials.tiktok));
  const [threads, setThreads] = useState(asString(socials.threads));

  const announcement = asRecord(settings.announcement_bar);
  const [annEnabled, setAnnEnabled] = useState(Boolean(announcement.enabled));
  const [annText, setAnnText] = useState(asString(announcement.text));

  const payments = asRecord(settings.payment_details);
  const jazz = asRecord(payments.jazzcash);
  const easy = asRecord(payments.easypaisa);
  const bank = asRecord(payments.bank);

  const [jazzNumber, setJazzNumber] = useState(asString(jazz.number));
  const [jazzName, setJazzName] = useState(asString(jazz.name));
  const [easyNumber, setEasyNumber] = useState(asString(easy.number));
  const [easyName, setEasyName] = useState(asString(easy.name));
  const [bankName, setBankName] = useState(asString(bank.bank_name));
  const [bankTitle, setBankTitle] = useState(asString(bank.account_title));
  const [bankNumber, setBankNumber] = useState(asString(bank.account_number));
  const [bankIban, setBankIban] = useState(asString(bank.iban));

  function save(key: string, value: unknown, message: string) {
    startTransition(async () => {
      const result = await saveSetting(key, value);
      if (result.ok) toast.success(message);
      else toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex max-w-2xl flex-col gap-6", pending && "opacity-90")}>
      <Block
        title="Home page headline"
        onSave={() => save("headline_text", headline, "Headline saved")}
      >
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={field} />
      </Block>

      <Block
        title="Menu"
        hint="Photo of your price list - shown on the public /menu page. Upload a new one whenever prices change."
        onSave={() => save("menu_image_url", menuImage, "Menu image saved")}
      >
        <ImageUploader
          bucket="categories"
          value={menuImage}
          onChange={setMenuImage}
          label="Menu photo"
        />
      </Block>

      <Block
        title="WhatsApp number"
        hint="Country code without +, e.g. 923217337801"
        onSave={() => save("whatsapp_number", whatsapp, "WhatsApp number saved")}
      >
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={field} />
      </Block>

      <Block
        title="Late-night delivery fee"
        hint="Added to the After 10 PM slot, on top of any area fee - even inside the city"
        onSave={() => save("late_night_fee", Number(lateFee) || 0, "Late-night fee saved")}
      >
        <input
          type="number"
          inputMode="numeric"
          value={lateFee}
          onChange={(e) => setLateFee(e.target.value)}
          className={field}
        />
      </Block>

      <Block
        title="Opening hours"
        onSave={() =>
          save(
            "business_hours",
            { open: openTime, close: closeTime, days: "all" },
            "Hours saved"
          )
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>Opens</span>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <span className={label}>Closes</span>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className={field}
            />
          </div>
        </div>
      </Block>

      <Block
        title="Announcement bar"
        hint="Shows across the top of the public site when switched on"
        onSave={() =>
          save("announcement_bar", { enabled: annEnabled, text: annText }, "Announcement saved")
        }
      >
        <label className="mb-2 flex min-h-11 items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={annEnabled}
            onChange={(e) => setAnnEnabled(e.target.checked)}
            className="h-5 w-5 accent-rosewood"
          />
          Show the announcement bar
        </label>
        <input
          value={annText}
          onChange={(e) => setAnnText(e.target.value)}
          placeholder="Eid orders close on the 20th"
          className={field}
        />
      </Block>

      <Block
        title="Social links"
        onSave={() =>
          save(
            "social_links",
            { instagram, facebook, tiktok, threads },
            "Social links saved"
          )
        }
      >
        <div className="flex flex-col gap-2">
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className={field} />
          <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook" className={field} />
          <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="TikTok" className={field} />
          <input value={threads} onChange={(e) => setThreads(e.target.value)} placeholder="Threads" className={field} />
        </div>
      </Block>

      <Block
        title="Payment details"
        hint="Shown to first-time customers, who must pay in advance"
        onSave={() =>
          save(
            "payment_details",
            {
              jazzcash: { number: jazzNumber, name: jazzName },
              easypaisa: { number: easyNumber, name: easyName },
              bank: {
                bank_name: bankName,
                account_title: bankTitle,
                account_number: bankNumber,
                iban: bankIban,
              },
            },
            "Payment details saved"
          )
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <span className={label}>JazzCash</span>
            <div className="grid grid-cols-2 gap-2">
              <input value={jazzNumber} onChange={(e) => setJazzNumber(e.target.value)} placeholder="Number" className={field} />
              <input value={jazzName} onChange={(e) => setJazzName(e.target.value)} placeholder="Account name" className={field} />
            </div>
          </div>
          <div>
            <span className={label}>Easypaisa</span>
            <div className="grid grid-cols-2 gap-2">
              <input value={easyNumber} onChange={(e) => setEasyNumber(e.target.value)} placeholder="Number" className={field} />
              <input value={easyName} onChange={(e) => setEasyName(e.target.value)} placeholder="Account name" className={field} />
            </div>
          </div>
          <div>
            <span className={label}>Bank</span>
            <div className="flex flex-col gap-2">
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" className={field} />
              <input value={bankTitle} onChange={(e) => setBankTitle(e.target.value)} placeholder="Account title" className={field} />
              <input value={bankNumber} onChange={(e) => setBankNumber(e.target.value)} placeholder="Account number" className={field} />
              <input value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="IBAN" className={field} />
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}

function Block({
  title,
  hint,
  children,
  onSave,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  return (
    <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
      <h2 className="text-sm font-medium text-ink">{title}</h2>
      {hint ? <p className="mb-2 mt-0.5 text-xs text-ink/55">{hint}</p> : <div className="mb-2" />}
      {children}
      <button
        type="button"
        onClick={onSave}
        className="mt-3 min-h-11 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
      >
        Save
      </button>
    </section>
  );
}

"use client";

import { useActionState, useRef, useState } from "react";
import { Button, ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { buildCustomCakeMessage, whatsappLink } from "@/lib/utils/whatsapp";
import {
  submitCustomCakeRequest,
  type CustomCakeState,
} from "@/app/(public)/custom-cake/actions";

const INITIAL: CustomCakeState = { status: "idle", message: "" };

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding / Walima",
  "Engagement",
  "Graduation",
  "Religious occasion",
  "Corporate / bulk",
  "Something else",
];

const FLAVOURS = [
  "Chocolate Fudge",
  "Vanilla",
  "Red Velvet",
  "Black Forest",
  "Butterscotch",
  "Pineapple",
  "Coffee Walnut",
  "Fresh Fruit",
  "Not sure yet",
];

const STEPS = ["Occasion", "Size", "Flavour", "Design", "Date & contact"];

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const inputClass =
  "min-h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none transition-colors focus:border-rosewood";

/**
 * Five steps, no reloads (§10). Every field lives in one <form> the
 * whole time and steps just toggle visibility - that way the browser
 * keeps the values, a back-step never loses input, and the final submit
 * posts the complete FormData in one go.
 */
export function CustomCakeForm({ minDate }: { minDate: string }) {
  const [state, formAction, isPending] = useActionState(submitCustomCakeRequest, INITIAL);
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState("");
  const [flavor, setFlavor] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    if (uploads.length + files.length > MAX_FILES) {
      setUploadError(`You can attach up to ${MAX_FILES} pictures.`);
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_BYTES)) {
      setUploadError("Each picture needs to be under 5 MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    const supabase = createClient();

    try {
      const paths: string[] = [];
      for (const file of files) {
        const extension = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;
        // order-refs is private with anonymous INSERT (Phase 2 storage
        // policies) - the customer can attach, only the admin can read.
        const { error } = await supabase.storage.from("order-refs").upload(path, file);
        if (error) throw error;
        paths.push(path);
      }
      setUploads((current) => [...current, ...paths]);
    } catch {
      setUploadError("That upload didn't go through. You can send pictures on WhatsApp instead.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (state.status === "success") {
    const waHref = whatsappLink(
      buildCustomCakeMessage({
        occasion: state.submitted?.occasion ?? null,
        tiers: state.submitted?.tiers ?? null,
        weightKg: state.submitted?.weightKg ?? null,
        flavor: state.submitted?.flavor ?? null,
        requiredDate: state.submitted?.requiredDate ?? null,
      })
    );

    return (
      <div className="flex flex-col items-start gap-5 rounded-lg border border-cream-200 bg-cream-100 p-6">
        <h2 className="text-lg text-ink">Request sent</h2>
        <p className="max-w-md text-base text-ink/75">{state.message}</p>
        <p className="max-w-md text-sm text-ink/60">
          Quotes usually come back the same day during shop hours. Sending it on WhatsApp too is
          the fastest way to get an answer.
        </p>
        <ButtonLink variant="whatsapp" href={waHref} external>
          <WhatsAppIcon />
          Continue on WhatsApp
        </ButtonLink>
      </div>
    );
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-cream-200 bg-cream-100 p-5 md:p-6"
    >
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <ol className="mb-6 flex flex-wrap gap-x-2 gap-y-1">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "eyebrow transition-colors",
                index === step ? "text-rosewood" : "text-ink/40"
              )}
            >
              {index + 1}. {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="text-ink/25" aria-hidden="true">
                ·
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {/* Step 1 - occasion */}
      <fieldset className={cn("flex flex-col gap-4", step !== 0 && "hidden")}>
        <legend className="mb-2 text-lg text-ink">What&apos;s the cake for?</legend>
        <input type="hidden" name="occasion" value={occasion} />
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setOccasion(option)}
              aria-pressed={option === occasion}
              className={cn(
                "min-h-11 rounded-md border px-4 text-sm transition-colors",
                option === occasion
                  ? "border-rosewood bg-rosewood/10 text-ink"
                  : "border-cream-200 bg-cream-50 text-ink/80 hover:border-rosewood/50"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Step 2 - size and tiers */}
      <fieldset className={cn("flex flex-col gap-4", step !== 1 && "hidden")}>
        <legend className="mb-2 text-lg text-ink">How big?</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tiers" className="text-sm font-medium text-ink">
              Number of tiers
            </label>
            <input
              id="tiers"
              name="tiers"
              type="number"
              inputMode="numeric"
              min={1}
              max={6}
              defaultValue={1}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="weight_kg" className="text-sm font-medium text-ink">
              Approximate weight (kg)
            </label>
            <input
              id="weight_kg"
              name="weight_kg"
              type="number"
              inputMode="decimal"
              min={0.5}
              step={0.5}
              placeholder="e.g. 2"
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-sm text-ink/60">
          One pound is about 0.45 kg. If you&apos;re not sure, give us the number of guests in the
          design step and we&apos;ll suggest a size.
        </p>
      </fieldset>

      {/* Step 3 - flavour */}
      <fieldset className={cn("flex flex-col gap-4", step !== 2 && "hidden")}>
        <legend className="mb-2 text-lg text-ink">Which flavour?</legend>
        <input type="hidden" name="flavor" value={flavor} />
        <div className="flex flex-wrap gap-2">
          {FLAVOURS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFlavor(option)}
              aria-pressed={option === flavor}
              className={cn(
                "min-h-11 rounded-md border px-4 text-sm transition-colors",
                option === flavor
                  ? "border-rosewood bg-rosewood/10 text-ink"
                  : "border-cream-200 bg-cream-50 text-ink/80 hover:border-rosewood/50"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Step 4 - theme description + references */}
      <fieldset className={cn("flex flex-col gap-4", step !== 3 && "hidden")}>
        <legend className="mb-2 text-lg text-ink">Describe the design</legend>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="theme_description" className="text-sm font-medium text-ink">
            What should it look like?
          </label>
          <textarea
            id="theme_description"
            name="theme_description"
            rows={5}
            maxLength={1200}
            placeholder="Colours, theme, characters, the name and age to write on it, number of guests - anything you already know."
            className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none transition-colors focus:border-rosewood"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reference-upload" className="text-sm font-medium text-ink">
            Reference pictures <span className="font-normal text-ink/60">(optional, up to 3)</span>
          </label>
          <input
            id="reference-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={uploading || uploads.length >= MAX_FILES}
            className="min-h-11 w-full rounded-md border border-dashed border-cream-200 bg-cream-50 p-2.5 text-sm text-ink/80 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-cream-200 file:px-3 file:text-sm file:text-ink"
          />
          {uploads.map((path) => (
            <input key={path} type="hidden" name="reference_images" value={path} />
          ))}
          {uploading ? <p className="text-sm text-ink/60">Uploading…</p> : null}
          {uploads.length ? (
            <p className="text-sm text-pista">
              {uploads.length} picture{uploads.length === 1 ? "" : "s"} attached.
            </p>
          ) : null}
          {uploadError ? <p className="text-sm text-rosewood-d">{uploadError}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget_min" className="text-sm font-medium text-ink">
              Budget from (Rs.)
            </label>
            <input
              id="budget_min"
              name="budget_min"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget_max" className="text-sm font-medium text-ink">
              Budget up to (Rs.)
            </label>
            <input
              id="budget_max"
              name="budget_max"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Step 5 - date and contact */}
      <fieldset className={cn("flex flex-col gap-4", step !== 4 && "hidden")}>
        <legend className="mb-2 text-lg text-ink">When do you need it?</legend>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="required_date" className="text-sm font-medium text-ink">
            Date needed
          </label>
          <input
            id="required_date"
            name="required_date"
            type="date"
            min={minDate}
            className={inputClass}
          />
          <p className="text-sm text-ink/60">
            Custom cakes need at least three days. Five or more for elaborate designs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Your name
            </label>
            <input id="name" name="name" type="text" required maxLength={80} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-ink">
              WhatsApp number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              placeholder="0321 7337801"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {state.status === "error" ? (
        <p role="status" className="mt-5 text-sm text-rosewood-d">
          {state.message}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3 border-t border-cream-200 pt-5">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}

        {isLastStep ? (
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending…" : "Send request"}
          </Button>
        ) : (
          <Button type="button" onClick={() => setStep((s) => s + 1)} className="ml-auto">
            Next
          </Button>
        )}
      </div>
    </form>
  );
}

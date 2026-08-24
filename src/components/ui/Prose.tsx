/** Shared reading column for the policy pages. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-2xl flex-col gap-6 text-base leading-relaxed text-ink/75 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:text-ink [&_li]:pl-1 [&_strong]:text-ink [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

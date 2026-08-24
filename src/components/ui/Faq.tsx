/**
 * Native <details>/<summary> - keyboard accessible, works without
 * JavaScript, and needs no accordion library.
 */
export function Faq({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  return (
    <div className="flex flex-col divide-y divide-cream-200 border-y border-cream-200">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium text-ink transition-colors hover:text-rosewood [&::-webkit-details-marker]:hidden">
            {item.question}
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5 shrink-0 text-rosewood transition-transform group-open:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M10 4v12M4 10h12" />
            </svg>
          </summary>
          <div className="pb-5 pr-8 text-base leading-relaxed text-ink/75">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

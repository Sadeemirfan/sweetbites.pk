import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <Section tone="cream">
      <div className="flex max-w-md flex-col items-start gap-5 py-10">
        <span className="eyebrow text-rosewood">Page not found</span>
        <h1 className="text-xl text-ink md:text-2xl">This page isn&apos;t here</h1>
        <p className="text-base text-ink/70">
          The cake or page you were looking for may have been renamed or taken down.
        </p>
        <ButtonLink variant="primary" href="/">
          Choose your branch
        </ButtonLink>
      </div>
    </Section>
  );
}

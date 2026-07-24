import Link from "next/link";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center self-start rounded-xl px-1 font-semibold text-brand-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/30 sm:self-auto"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export { SectionHeader };

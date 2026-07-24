import Link from "next/link";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

/** Like `OverviewCard`, but without a fake period-over-period growth indicator. */
export function StatCard({ label, value, hint, href, Icon }: PropsType) {
  const body = (
    <>
      <Icon />

      <div className="mt-6">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {value}
          </dt>
          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>
        {hint ? (
          <p className="mt-1.5 text-xs text-dark-6/80 dark:text-dark-6">{hint}</p>
        ) : null}
        {href ? (
          <p className="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Xem chi tiết →
          </p>
        ) : null}
      </div>
    </>
  );

  const className =
    "group block rounded-[10px] bg-white p-6 shadow-1 outline-none transition hover:shadow-md hover:ring-1 hover:ring-primary/25 focus-visible:ring-2 focus-visible:ring-primary dark:bg-gray-dark dark:hover:ring-primary/40";

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`${label}: xem chi tiết`}>
        {body}
      </Link>
    );
  }

  return <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">{body}</div>;
}

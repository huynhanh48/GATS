import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  value: string;
  hint?: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

/** Like `OverviewCard`, but without a fake period-over-period growth indicator. */
export function StatCard({ label, value, hint, Icon }: PropsType) {
  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
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
      </div>
    </div>
  );
}

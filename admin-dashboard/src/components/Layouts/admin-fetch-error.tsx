import Link from "next/link";

type Props = {
  message: string;
  /** Current page path for retry (full refresh). */
  retryHref?: string;
};

export function AdminFetchError({ message, retryHref }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
    >
      <p className="font-medium">Không tải được dữ liệu</p>
      <p className="mt-1 opacity-90">{message}</p>
      {retryHref ? (
        <Link
          href={retryHref}
          className="mt-2 inline-block font-medium text-rose-700 underline hover:no-underline dark:text-rose-300"
        >
          Thử lại
        </Link>
      ) : null}
    </div>
  );
}

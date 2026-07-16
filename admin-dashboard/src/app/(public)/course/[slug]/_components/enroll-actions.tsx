"use client";

import type { CourseDetail } from "@/lib/api/types";
import { formatLandingPrice, formatVnd, hasActiveSale } from "@/lib/landing/courses";
import { cartClient } from "@/services/cart.client";
import { enrollmentClient } from "@/services/learner.client";
import { useSession } from "@/services/auth.client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  course: Pick<
    CourseDetail,
    "id" | "slug" | "price" | "salePrice" | "title"
  >;
};

export function CourseEnrollActions({ course }: Props) {
  const session = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState<"enroll" | "cart" | null>(null);

  const isFree = course.price <= 0;
  const onSale = hasActiveSale({
    price: course.price,
    salePrice: course.salePrice,
    isFree,
  });

  async function requireAuth(next: string) {
    if (!session.data?.user) {
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(next)}`);
      return false;
    }
    return true;
  }

  async function handleEnrollFree() {
    if (!(await requireAuth(`/course/${course.slug}`))) return;
    setBusy("enroll");
    try {
      const result = await enrollmentClient.enrollFree(course.id);
      if (result.error) throw new Error(result.error.message);
      toast.success("Đã ghi danh khóa học miễn phí");
      router.push("/my-courses");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ghi danh thất bại");
    } finally {
      setBusy(null);
    }
  }

  async function handleAddToCart() {
    if (!(await requireAuth(`/course/${course.slug}`))) return;
    setBusy("cart");
    try {
      const result = await cartClient.add(course.id);
      if (result.error) throw new Error(result.error.message);
      toast.success("Đã thêm vào giỏ hàng");
      router.push("/cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thêm được giỏ");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111]">
      <div className="mb-4">
        {onSale ? (
          <>
            <p className="text-sm text-slate-500 line-through dark:text-slate-400">
              {formatVnd(course.price)}
            </p>
            <p className="text-2xl font-bold text-[#f97316]">
              {formatLandingPrice({
                price: course.price,
                salePrice: course.salePrice,
                isFree,
              })}
            </p>
          </>
        ) : (
          <p
            className={`text-2xl font-bold ${
              isFree ? "text-emerald-400" : "text-[#f97316]"
            }`}
          >
            {formatLandingPrice({
              price: course.price,
              salePrice: course.salePrice,
              isFree,
            })}
          </p>
        )}
      </div>

      {isFree ? (
        <button
          type="button"
          disabled={busy !== null || session.isPending}
          onClick={() => void handleEnrollFree()}
          className="w-full cursor-pointer rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy === "enroll" ? "Đang ghi danh…" : "Học miễn phí"}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={busy !== null || session.isPending}
            onClick={() => void handleAddToCart()}
            className="w-full cursor-pointer rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-60"
          >
            {busy === "cart" ? "Đang thêm…" : "Thêm vào giỏ"}
          </button>
          <Link
            href="/cart"
            className="w-full rounded-full border border-slate-300 px-5 py-3 text-center text-sm text-slate-800 transition hover:border-slate-950 dark:border-slate-700 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Xem giỏ hàng
          </Link>
        </div>
      )}
    </div>
  );
}

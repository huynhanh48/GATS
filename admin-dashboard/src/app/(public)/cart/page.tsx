"use client";

import { LandingNav } from "@/components/Landing/LandingNav";
import type { BankTransferPayment, CartView } from "@/lib/api/types";
import { formatVnd } from "@/lib/landing/courses";
import { cartClient } from "@/services/cart.client";
import { orderClient, paymentClient } from "@/services/learner.client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [payment, setPayment] = useState<BankTransferPayment | null>(null);
  const [paid, setPaid] = useState(false);
  const [checkingPay, setCheckingPay] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await cartClient.get();
    if (result.error) {
      toast.error(result.error.message);
      setCart(null);
    } else {
      setCart(result.data?.cart ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeItem(itemId: string) {
    const result = await cartClient.removeItem(itemId);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    setCart(result.data?.cart ?? null);
    toast.success("Đã xóa khỏi giỏ");
  }

  async function checkout() {
    setCheckingOut(true);
    try {
      const result = await orderClient.create({
        paymentMethod: "bank_transfer",
        fromCart: true,
      });
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? "Tạo đơn thất bại");
      }
      const pay = result.data.payment;
      if (pay.method !== "bank_transfer" || !("qrUrl" in pay)) {
        throw new Error("Phương thức thanh toán không hỗ trợ trên web này");
      }
      setPayment(pay);
      setCart(result.data ? ((await cartClient.get()).data?.cart ?? null) : null);
      toast.success("Đã tạo đơn — quét QR để thanh toán");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout thất bại");
    } finally {
      setCheckingOut(false);
    }
  }

  async function checkPayment() {
    if (!payment) return;
    setCheckingPay(true);
    try {
      const result = await paymentClient.checkSepay(payment.txnRef);
      if (result.error) throw new Error(result.error.message);
      if (result.data?.success || result.data?.status === "PAID") {
        setPaid(true);
        toast.success("Thanh toán thành công — khóa học đã được ghi danh");
      } else {
        toast.message(result.data?.message ?? "Chưa nhận được thanh toán");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kiểm tra thất bại");
    } finally {
      setCheckingPay(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="cart" tone="light" />

      <section className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
          Thanh toán chuyển khoản qua Sepay QR.
        </p>

        {loading ? (
          <p className="mt-10 text-slate-500 dark:text-gray-500">Đang tải…</p>
        ) : payment ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111]">
            {paid ? (
              <div className="space-y-4 text-center">
                <p className="text-lg font-semibold text-emerald-400">
                  Thanh toán thành công
                </p>
                <Link
                  href="/my-courses"
                  className="inline-block rounded-full bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Vào khóa học của tôi
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">Chuyển khoản ngân hàng</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                  Số tiền:{" "}
                  <span className="font-semibold text-[#f97316]">
                    {formatVnd(payment.amount)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                  Nội dung:{" "}
                  <code className="text-slate-950 dark:text-white">{payment.transferContent}</code>
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                  {payment.bankName} · {payment.bankAccountNumber} ·{" "}
                  {payment.bankAccountName}
                </p>
                <div className="relative mx-auto mt-6 h-56 w-56 overflow-hidden rounded-xl bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.qrUrl}
                    alt="QR thanh toán"
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  disabled={checkingPay}
                  onClick={() => void checkPayment()}
                  className="mt-6 w-full cursor-pointer rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {checkingPay ? "Đang kiểm tra…" : "Tôi đã chuyển khoản"}
                </button>
              </>
            )}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#111]">
            <p className="text-slate-600 dark:text-gray-400">Giỏ hàng trống.</p>
            <Link
              href="/course"
              className="mt-4 inline-block text-sm text-[#f97316] hover:underline"
            >
              Xem khóa học
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111]"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-[#222]">
                  {item.course.thumbnail ? (
                    <Image
                      src={item.course.thumbnail}
                      alt={item.course.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/course/${item.course.slug}`}
                    className="font-semibold text-slate-950 hover:underline dark:text-white"
                  >
                    {item.course.title}
                  </Link>
                  <p className="mt-1 text-sm text-[#f97316]">
                    {formatVnd(item.lineTotal)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeItem(item.id)}
                  className="cursor-pointer self-start text-xs text-slate-500 hover:text-slate-950 dark:text-gray-500 dark:hover:text-white"
                >
                  Xóa
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-gray-800">
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Tổng:{" "}
                <span className="text-lg font-bold text-slate-950 dark:text-white">
                  {formatVnd(cart.totalAmount)}
                </span>
              </p>
              <button
                type="button"
                disabled={checkingOut}
                onClick={() => void checkout()}
                className="cursor-pointer rounded-full bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {checkingOut ? "Đang tạo đơn…" : "Thanh toán Sepay"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

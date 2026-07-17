"use client";

import { LandingNav } from "@/components/Landing/LandingNav";
import type { BankTransferPayment, CartView } from "@/lib/api/types";
import { formatVnd } from "@/lib/landing/courses";
import { cartClient } from "@/services/cart.client";
import { orderClient, paymentClient } from "@/services/learner.client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (payment && !paid) {
      interval = setInterval(() => {
        const pollPayment = async () => {
          if (!payment) return;
          try {
            const result = await paymentClient.checkSepay(payment.txnRef);
            if (result.data?.success || result.data?.status === "PAID") {
              setPaid(true);
              toast.success("Thanh toán thành công — khóa học đã được ghi danh");
            }
          } catch (err) {
            // Ignore polling errors to keep UI clean
          }
        };
        void pollPayment();
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [payment, paid]);

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

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-8">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
          Thanh toán chuyển khoản qua Sepay QR.
        </p>

        {loading ? (
          <p className="mt-10 text-slate-500 dark:text-gray-500">Đang tải…</p>
        ) : payment ? (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/50 dark:border-gray-800 dark:bg-[#111] dark:shadow-none">
            {paid ? (
              <div className="space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                  Thanh toán thành công
                </h2>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Khóa học của bạn đã được kích hoạt. Hãy bắt đầu học ngay nhé!
                </p>
                <Link
                  href="/my-courses"
                  className="mt-4 inline-block w-full rounded-full bg-[#f97316] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ea580c] shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  Vào khóa học của tôi
                </Link>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Thanh toán chuyển khoản</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                  Mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.
                </p>
                
                <div className="relative mx-auto mt-8 h-64 w-64 overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.qrUrl}
                    alt="QR thanh toán"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-8 rounded-xl bg-slate-50 p-4 text-left dark:bg-[#222]">
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-semibold text-slate-950 dark:text-white">{payment.bankName}</span>
                    
                    <span className="text-slate-500">Số TK:</span>
                    <span className="font-semibold text-slate-950 dark:text-white">{payment.bankAccountNumber}</span>
                    
                    <span className="text-slate-500">Chủ TK:</span>
                    <span className="font-semibold text-slate-950 dark:text-white">{payment.bankAccountName}</span>
                    
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-[#f97316]">{formatVnd(payment.amount)}</span>
                    
                    <span className="text-slate-500">Nội dung:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit dark:bg-blue-900/30">{payment.transferContent}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
                  <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#f97316]" />
                  Đang chờ thanh toán...
                </div>

                <button
                  type="button"
                  disabled={checkingPay}
                  onClick={() => void checkPayment()}
                  className="mt-4 w-full cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-[#111] dark:text-slate-300 dark:hover:bg-[#222]"
                >
                  {checkingPay ? "Đang kiểm tra…" : "Tôi đã thanh toán thành công"}
                </button>
              </div>
            )}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm dark:border-gray-800 dark:bg-[#111]">
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
              <ShoppingBag className="size-8 text-slate-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Giỏ hàng trống</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-gray-400">
              Bạn chưa có khóa học nào trong giỏ. Hãy khám phá và chọn cho mình khóa học phù hợp nhé.
            </p>
            <Link
              href="/course"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f97316] dark:bg-white dark:text-slate-950 dark:hover:bg-[#f97316] dark:hover:text-white"
            >
              Khám phá khóa học
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Column 1: Items List */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111]"
                >
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-[#222]">
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
                      className="font-semibold text-slate-950 hover:text-[#f97316] dark:text-white transition"
                    >
                      {item.course.title}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-[#f97316]">
                      {formatVnd(item.lineTotal)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeItem(item.id)}
                    className="cursor-pointer self-start rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition dark:bg-slate-800 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    aria-label="Xóa khỏi giỏ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Column 2: Order Summary */}
            <div className="sticky top-24 self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111]">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-5">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 text-sm text-slate-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-950 dark:text-white">{formatVnd(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span className="font-semibold text-emerald-600">0đ</span>
                </div>
                
                <div className="border-t border-slate-200 pt-4 dark:border-gray-800 flex justify-between items-end">
                  <span className="font-bold text-slate-950 dark:text-white">Tổng tiền</span>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-[#f97316] leading-none">{formatVnd(cart.totalAmount)}</span>
                    <span className="text-[11px] text-slate-500">Đã bao gồm VAT</span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                disabled={checkingOut}
                onClick={() => void checkout()}
                className="mt-6 w-full cursor-pointer rounded-full bg-[#f97316] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ea580c] disabled:opacity-60 shadow-lg shadow-orange-200 dark:shadow-none"
              >
                {checkingOut ? "Đang tạo đơn…" : "Thanh toán Sepay"}
              </button>
              
              <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Thanh toán chuyển khoản an toàn
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

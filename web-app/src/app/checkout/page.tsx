"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle2, Copy, Tag, X } from "lucide-react";
import { orderApi, couponApi, type CouponPreview } from "@/lib/cart/api";
import { resolveMediaUrl } from "@/lib/media/url";
import { toast } from "sonner";

type QrPaymentState = {
  /** Có thể null nếu provider QR lỗi — vẫn thanh toán bằng thông tin CK */
  qrUrl: string | null;
  amount: number;
  txnRef: string;
  orderId?: string;
  /** ISO timestamp — QR valid until this time (30 minutes) */
  expiresAt?: string;
  transferContent?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  /** SePay Payment Gateway hosted checkout */
  checkoutUrl?: string;
  checkoutFields?: Record<string, string>;
};

const QR_PAYMENT_TTL_MS = 30 * 60 * 1000;

function submitSepayCheckout(
  checkoutUrl: string,
  checkoutFields: Record<string, string>,
) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  form.style.display = "none";
  for (const [name, value] of Object.entries(checkoutFields)) {
    if (value == null || value === "") continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function resolveExpiresAt(createdAt?: string | Date | null, fallbackIso?: string) {
  if (fallbackIso) return fallbackIso;
  if (createdAt) {
    const base = new Date(createdAt).getTime();
    if (!Number.isNaN(base)) {
      return new Date(base + QR_PAYMENT_TTL_MS).toISOString();
    }
  }
  return new Date(Date.now() + QR_PAYMENT_TTL_MS).toISOString();
}

function InvoiceRow({
  label,
  value,
  mono,
  copyable,
  emphasize,
  valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  emphasize?: boolean;
  valueClassName?: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã copy ${label.toLowerCase()}`);
    } catch {
      toast.error("Không copy được");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {copyable ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        ) : null}
      </div>
      <p
        className={[
          "text-sm font-semibold text-foreground break-all select-all",
          mono ? "font-mono tracking-tight" : "",
          emphasize ? "text-base" : "",
          valueClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

const PENDING_PAYMENT_KEY = "gats.checkout.pendingPayment";

function readPendingPayment(): QrPaymentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QrPaymentState;
    if (!parsed?.txnRef) return null;
    return {
      ...parsed,
      qrUrl: parsed.qrUrl || null,
    };
  } catch {
    return null;
  }
}

function writePendingPayment(data: QrPaymentState | null) {
  if (typeof window === "undefined") return;
  try {
    if (!data) sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    else sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / private mode
  }
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, isLoading: isCartLoading, refreshCart } =
    useCart();
  const { user, status } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState<QrPaymentState | null>(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [qrBroken, setQrBroken] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(
    null,
  );
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID">(
    "PENDING",
  );
  const [remainingMs, setRemainingMs] = useState<number>(QR_PAYMENT_TTL_MS);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restoredRef = useRef(false);
  const expiringRef = useRef(false);
  const checkingRef = useRef(false);
  const paidOnceRef = useRef(false);

  useEffect(() => {
    if (status === "anonymous") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && user && !name) {
      setName(user.userName);
    }
  }, [user, status, name]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const pending = readPendingPayment();
    if (!pending) return;

    let cancelled = false;
    (async () => {
      try {
        const res: any = await orderApi.listOrders();
        const orders: any[] = Array.isArray(res?.data) ? res.data : [];
        const match = orders.find(
          (o) =>
            o?.status === "pending" &&
            (o?.txnRef === pending.txnRef ||
              (pending.orderId && o?.id === pending.orderId)),
        );

        if (cancelled) return;

        // Đơn cũ đã hủy/thanh toán hoặc không còn trên server → bỏ QR stale
        if (!match) {
          writePendingPayment(null);
          return;
        }

        const expiresAt = resolveExpiresAt(
          match.createdAt,
          match.expiresAt || pending.expiresAt,
        );
        if (new Date(expiresAt).getTime() <= Date.now()) {
          if (match.id) {
            await orderApi.cancelOrder(match.id).catch(() => undefined);
          }
          writePendingPayment(null);
          return;
        }

        const synced: QrPaymentState = {
          ...pending,
          orderId: match.id,
          // Luôn lấy số tiền từ đơn trên BE, không tin amount trong sessionStorage
          amount: Number(match.totalAmount) || pending.amount,
          txnRef: match.txnRef || pending.txnRef,
          expiresAt,
        };
        writePendingPayment(synced);
        setQrBroken(!synced.qrUrl);
        setQrData(synced);
        setPaymentStatus("PENDING");
        paidOnceRef.current = false;
      } catch {
        // Nếu không verify được thì không restore QR cũ (tránh lệch giá khóa học)
        writePendingPayment(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const onPaid = useCallback(() => {
    if (paidOnceRef.current) return;
    paidOnceRef.current = true;
    stopPolling();
    setPaymentStatus("PAID");
    const orderId = qrData?.orderId;
    writePendingPayment(null);
    toast.success("Thanh toán thành công! Khóa học đã được mở.");
    const q = new URLSearchParams({ status: "paid" });
    if (orderId) q.set("orderId", orderId);
    router.push(`/checkout/result?${q.toString()}`);
  }, [qrData?.orderId, router, stopPolling]);

  const abandonQrPayment = useCallback(
    async (opts?: { reason?: "expired" | "manual"; silentCancel?: boolean }) => {
      if (expiringRef.current) return;
      expiringRef.current = true;
      try {
        const orderId = qrData?.orderId;
        const txnRef = qrData?.txnRef;
        if (orderId) {
          await orderApi.cancelOrder(orderId).catch(() => undefined);
        } else if (txnRef) {
          const res: any = await orderApi.listOrders().catch(() => null);
          const orders: any[] = Array.isArray(res?.data) ? res.data : [];
          const match = orders.find(
            (o) => o?.status === "pending" && o?.txnRef === txnRef,
          );
          if (match?.id) {
            await orderApi.cancelOrder(match.id).catch(() => undefined);
          }
        }
        stopPolling();
        setQrData(null);
        writePendingPayment(null);
        if (opts?.reason === "expired") {
          toast.error("Hết 30 phút — đơn QR đã bị hủy. Vui lòng tạo lại.");
          const q = new URLSearchParams({ status: "expired" });
          if (orderId) q.set("orderId", orderId);
          router.push(`/checkout/result?${q.toString()}`);
          return;
        }
        if (!opts?.silentCancel) {
          toast.success(
            "Đã hủy đơn cũ. Thêm khóa vào giỏ và thanh toán lại.",
          );
        }
        router.push("/cart");
      } finally {
        expiringRef.current = false;
      }
    },
    [qrData?.orderId, qrData?.txnRef, router, stopPolling],
  );

  const checkOnce = useCallback(
    async (txnRef: string): Promise<"paid" | "pending" | "stopped"> => {
      if (checkingRef.current || paidOnceRef.current) return "pending";
      checkingRef.current = true;
      try {
        const res: any = await orderApi.checkSepay(txnRef);
        const status = String(res?.status || "").toUpperCase();
        if (res?.success === true && status === "PAID") {
          onPaid();
          return "paid";
        }
        if (status === "EXPIRED") {
          await abandonQrPayment({ reason: "expired" });
          return "stopped";
        }
        if (status === "AMOUNT_MISMATCH") {
          stopPolling();
          writePendingPayment(null);
          setQrData(null);
          toast.error(
            "Số tiền chuyển khoản không khớp đơn. Vui lòng liên hệ hỗ trợ hoặc tạo đơn mới.",
          );
          return "stopped";
        }
        return "pending";
      } catch (err: any) {
        console.error("Sepay check failed", err);
        const msg = String(err?.message || err?.error || "");
        if (/amount mismatch/i.test(msg) || /số tiền/i.test(msg)) {
          stopPolling();
          writePendingPayment(null);
          setQrData(null);
          toast.error(
            "Số tiền chuyển khoản không khớp đơn. Vui lòng liên hệ hỗ trợ — có thể đây là đơn 0đ (mã giảm).",
          );
          return "stopped";
        }
        return "pending";
      } finally {
        checkingRef.current = false;
      }
    },
    [abandonQrPayment, onPaid, stopPolling],
  );

  useEffect(() => {
    if (!qrData?.txnRef || paymentStatus === "PAID") return;
    stopPolling();
    void checkOnce(qrData.txnRef);
    pollRef.current = setInterval(() => {
      void checkOnce(qrData.txnRef);
    }, 3000);
    return stopPolling;
  }, [qrData, paymentStatus, checkOnce, stopPolling]);

  useEffect(() => {
    if (!qrData?.expiresAt || paymentStatus === "PAID") return;

    const tick = () => {
      const left = new Date(qrData.expiresAt!).getTime() - Date.now();
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        void abandonQrPayment({ reason: "expired" });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [qrData?.expiresAt, paymentStatus, abandonQrPayment]);

  if (status === "loading" || isCartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  if (items.length === 0 && !qrData) {
    router.push("/cart");
    return null;
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const preview = await couponApi.preview(code, totalAmount);
      setCouponPreview(preview);
      toast.success(`Đã áp dụng mã ${preview.code}`);
    } catch (err: any) {
      setCouponPreview(null);
      const message =
        err?.message || err?.error || "Mã giảm giá không hợp lệ";
      setCouponError(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponPreview(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setPhoneError("");

    let hasError = false;
    if (!name.trim()) {
      setNameError("Vui lòng điền họ và tên");
      hasError = true;
    }
    if (!phone.trim()) {
      setPhoneError("Vui lòng điền số điện thoại");
      hasError = true;
    } else if (!/^[0-9]{10,11}$/.test(phone.trim().replace(/\s+/g, ""))) {
      setPhoneError("Số điện thoại không hợp lệ (10-11 số)");
      hasError = true;
    }

    if (hasError) {
      toast.error("Vui lòng kiểm tra lại thông tin liên hệ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await orderApi.createOrder({
        fromCart: true,
        paymentMethod: "bank_transfer",
        customerName: name,
        customerPhone: phone,
        customerEmail: user?.email,
        ...(couponPreview?.code ? { couponCode: couponPreview.code } : {}),
      });

      // BE already cleared cart items for this order.
      await clearCart().catch(() => undefined);

      const payment = res?.payment;
      const orderId = res?.order?.id as string | undefined;

      // Coupon brought total to 0đ — already paid + enrolled on BE.
      if (
        payment?.status === "success" ||
        res?.order?.status === "paid"
      ) {
        setQrData(null);
        writePendingPayment(null);
        toast.success("Áp mã thành công — khóa học đã được kích hoạt.");
        const params = new URLSearchParams({ status: "paid" });
        if (orderId) params.set("orderId", orderId);
        if (payment?.txnRef) params.set("txnRef", String(payment.txnRef));
        router.push(`/checkout/result?${params.toString()}`);
        return;
      }

      if (
        payment?.method === "bank_transfer" &&
        payment?.txnRef &&
        payment?.checkoutUrl &&
        payment?.checkoutFields &&
        typeof payment.checkoutFields === "object"
      ) {
        toast.success("Đang chuyển tới cổng thanh toán SePay…");
        submitSepayCheckout(
          payment.checkoutUrl,
          payment.checkoutFields as Record<string, string>,
        );
        return;
      }

      const hasBankFallback = Boolean(
        payment?.txnRef &&
          (payment?.bankAccountNumber ||
            payment?.transferContent ||
            payment?.bankName),
      );
      if (
        payment?.method === "bank_transfer" &&
        payment?.txnRef &&
        (payment?.qrUrl || hasBankFallback)
      ) {
        paidOnceRef.current = false;
        const hasQr = Boolean(payment.qrUrl);
        setQrBroken(!hasQr);
        setPaymentStatus("PENDING");
        const nextQr: QrPaymentState = {
          qrUrl: payment.qrUrl || null,
          amount: payment.amount,
          txnRef: payment.txnRef,
          orderId: res?.order?.id,
          expiresAt: resolveExpiresAt(
            res?.order?.createdAt,
            payment.expiresAt,
          ),
          transferContent: payment.transferContent,
          bankName: payment.bankName,
          bankAccountNumber: payment.bankAccountNumber,
          bankAccountName: payment.bankAccountName,
        };
        setQrData(nextQr);
        writePendingPayment(nextQr);
        toast.success(
          hasQr
            ? "Đơn hàng đã được tạo. Vui lòng quét mã QR để thanh toán."
            : "Đơn hàng đã được tạo. Dùng thông tin chuyển khoản bên dưới.",
        );
      } else {
        toast.error(
          payment?.message ||
            "Không tạo được thông tin thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        );
        await refreshCart();
      }
    } catch (err: any) {
      const message =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : null) ||
        "Lỗi khi tạo đơn hàng";
      toast.error(message);
      await refreshCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaidClick = async () => {
    if (!qrData) return;
    setIsSubmitting(true);
    try {
      const result = await checkOnce(qrData.txnRef);
      if (result === "pending") {
        toast.info(
          "Chưa nhận được thanh toán. Hệ thống vẫn đang kiểm tra tự động.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (qrData) {
    return (
      <main className="min-h-screen bg-background relative flex flex-col">
        {/* Full-screen payment sheet — avoid floating Header overlapping the invoice */}
        <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                if (
                  !window.confirm(
                    "Quay lại sẽ hủy đơn đang chờ thanh toán. Tiếp tục?",
                  )
                ) {
                  return;
                }
                setIsSubmitting(true);
                try {
                  await abandonQrPayment({ reason: "manual" });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-70"
            >
              ← Quay lại giỏ hàng
            </button>
            <span className="text-sm font-semibold text-foreground">
              Thanh toán QR
            </span>
            <span className="w-24" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
            <div className="bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-2">Thanh toán đơn hàng</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Mở ứng dụng ngân hàng và quét mã QR bên dưới. Hệ thống sẽ tự xác
                nhận khi nhận được chuyển khoản.
              </p>

              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                <p className="font-semibold">Lưu ý khi chuyển khoản</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                  <li>
                    Chuyển <span className="font-semibold">đúng số tiền</span> trên
                    hóa đơn (không làm tròn / tách khoản).
                  </li>
                  <li>
                    Giữ nguyên{" "}
                    <span className="font-semibold">nội dung CK</span> (mã{" "}
                    <span className="font-mono">SEVQR…</span>) — không sửa, thêm
                    hoặc xóa ký tự.
                  </li>
                  <li>
                    Quét QR là cách an toàn nhất; nếu chuyển tay, copy nội dung CK
                    bên dưới.
                  </li>
                </ul>
              </div>

              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold ${
                  remainingMs <= 5 * 60 * 1000
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                Thời gian còn lại:{" "}
                <span className="font-mono text-base tabular-nums">
                  {formatCountdown(remainingMs)}
                </span>
                <span className="mt-1 block text-xs font-normal opacity-80">
                  Hết 30 phút đơn sẽ tự hủy — vui lòng thanh toán trước hạn.
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl mx-auto inline-block border-2 border-primary/20 shadow-inner mb-6">
                {qrData.qrUrl && !qrBroken ? (
                  <img
                    src={qrData.qrUrl}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                    onError={() => setQrBroken(true)}
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
                    {qrData.qrUrl
                      ? "Không tải được QR. Dùng thông tin chuyển khoản bên dưới."
                      : "QR chưa khả dụng. Dùng thông tin chuyển khoản bên dưới."}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-3">
                <InvoiceRow
                  label="Số tiền"
                  value={`${qrData.amount.toLocaleString("vi-VN")} đ`}
                  valueClassName="font-bold text-primary"
                />
                <InvoiceRow
                  label="Mã GD"
                  value={qrData.txnRef}
                  mono
                  copyable
                />
                {qrData.bankAccountName ? (
                  <InvoiceRow label="Chủ TK" value={qrData.bankAccountName} />
                ) : null}
                {qrData.bankName || qrData.bankAccountNumber ? (
                  <InvoiceRow
                    label="Ngân hàng"
                    value={[qrData.bankName, qrData.bankAccountNumber]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ) : null}
                {qrData.transferContent ? (
                  <InvoiceRow
                    label="Nội dung CK"
                    value={qrData.transferContent}
                    mono
                    copyable
                    emphasize
                  />
                ) : null}
                <p className="text-xs text-muted-foreground pt-1">
                  Trạng thái:{" "}
                  <span className="font-semibold text-foreground">
                    {paymentStatus === "PAID"
                      ? "Đã thanh toán"
                      : "Đang chờ thanh toán…"}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handlePaidClick}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Đang kiểm tra…" : "Tôi đã thanh toán xong"}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Hủy đơn QR này để thanh toán lại theo giá khóa học hiện tại?",
                    )
                  ) {
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    await abandonQrPayment({ reason: "manual" });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full mt-3 border border-border text-muted-foreground py-3 rounded-xl font-medium hover:bg-muted/50 transition-colors disabled:opacity-70"
              >
                Hủy đơn này & thanh toán lại
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative pt-24 pb-16">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-4 mt-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-1 transition-colors ${
                      nameError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {nameError ? (
                    <p className="text-red-500 text-sm mt-1.5">{nameError}</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-1 transition-colors ${
                      phoneError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {phoneError ? (
                    <p className="text-red-500 text-sm mt-1.5">{phoneError}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-xl border-primary bg-primary/5 ring-1 ring-primary">
                  <QrCode className="w-6 h-6 mr-4 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-bold">Quét mã QR Ngân hàng</h3>
                    <p className="text-xs text-muted-foreground">
                      Chuyển khoản VietQR / Sepay (đang hỗ trợ)
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </label>
                <p className="text-xs text-muted-foreground px-1">
                  Thẻ quốc tế, VNPay và MoMo sẽ được mở khi cổng thanh toán sẵn
                  sàng.
                </p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Chi tiết đơn hàng</h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.courseId} className="flex gap-3">
                    <div className="relative w-20 h-14 rounded overflow-hidden shrink-0 bg-muted">
                      <img
                        src={resolveMediaUrl(item.thumbnail)}
                        alt={item.courseName}
                        className="absolute inset-0 h-full w-full bg-muted p-1 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/auth-bg.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm line-clamp-2 leading-tight">
                        {item.courseName}
                      </h4>
                      <p className="text-primary font-bold text-sm mt-1">
                        {item.price.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Mã giảm giá
                </label>
                {couponPreview ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-bold text-primary truncate">
                        {couponPreview.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Bỏ mã giảm giá"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponError) setCouponError("");
                      }}
                      placeholder="Nhập mã giảm giá"
                      className={`flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-1 transition-colors ${
                        couponError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-border focus:border-primary focus:ring-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="shrink-0 rounded-xl border border-border px-4 py-2.5 text-sm font-bold hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Áp dụng"}
                    </button>
                  </div>
                )}
                {couponError ? (
                  <p className="text-red-500 text-sm mt-1.5">{couponError}</p>
                ) : null}
              </div>

              <div className="border-t border-border pt-4 mb-6 space-y-2">
                {couponPreview ? (
                  <>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Tạm tính</span>
                      <span>{totalAmount.toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
                      <span>Giảm giá</span>
                      <span>
                        -{couponPreview.discountAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </>
                ) : null}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary text-2xl">
                    {(couponPreview
                      ? couponPreview.finalAmount
                      : totalAmount
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
                {couponPreview && couponPreview.finalAmount === 0 ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Áp mã xong sẽ kích hoạt khóa ngay, không cần chuyển khoản.
                  </p>
                ) : null}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : couponPreview?.finalAmount === 0
                    ? "Kích hoạt khóa học"
                    : "Hoàn tất thanh toán"}
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Bằng việc hoàn tất thanh toán, bạn đồng ý với{" "}
                <Link href="/terms" className="font-semibold text-foreground hover:underline">
                  Điều khoản dịch vụ
                </Link>
                ,{" "}
                <Link href="/payment-policy" className="font-semibold text-foreground hover:underline">
                  Chính sách thanh toán
                </Link>{" "}
                và{" "}
                <Link href="/refund" className="font-semibold text-foreground hover:underline">
                  Chính sách hoàn tiền
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

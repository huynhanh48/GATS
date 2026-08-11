"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderApi } from "@/services/cart.service";
import {
  OrderReceiptView,
  type OrderReceiptData,
} from "@/components/orders/order-receipt-view";

export default function ProfileOrderReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;
  const [receipt, setReceipt] = useState<OrderReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await orderApi.getReceipt(orderId);
        const data = res?.data as OrderReceiptData | undefined;
        if (!cancelled) {
          if (!data) setError("Không tải được biên lai.");
          else setReceipt(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Không tải được biên lai.";
          setError(String(msg));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Đang tải biên lai…
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="mb-4 text-foreground">{error ?? "Không tìm thấy biên lai."}</p>
        <button
          type="button"
          onClick={() => router.push("/profile?tab=orders")}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Về lịch sử giao dịch
        </button>
      </div>
    );
  }

  return (
    <OrderReceiptView
      receipt={receipt}
      backHref="/profile?tab=orders"
    />
  );
}

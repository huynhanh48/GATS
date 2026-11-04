"use client";

import {
  OrderReceiptView,
  type OrderReceiptData,
} from "@/components/orders/order-receipt-view";

type Props = {
  receipt: OrderReceiptData;
  backHref: string;
};

export function OrderReceiptClient({ receipt, backHref }: Props) {
  return <OrderReceiptView receipt={receipt} backHref={backHref} />;
}

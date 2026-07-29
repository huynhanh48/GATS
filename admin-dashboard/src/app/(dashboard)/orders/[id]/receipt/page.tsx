import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchOrderReceipt } from "../../actions";
import { OrderReceiptClient } from "./order-receipt-client";

export const metadata: Metadata = {
  title: "In hóa đơn",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const receipt = await fetchOrderReceipt(id);
  if (!receipt) notFound();

  return (
    <OrderReceiptClient receipt={receipt} backHref={`/orders/${id}`} />
  );
}

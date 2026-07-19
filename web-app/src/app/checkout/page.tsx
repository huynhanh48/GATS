"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard, QrCode, Wallet, CheckCircle2 } from "lucide-react";
import { orderApi } from "@/lib/cart/api";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, isLoading: isCartLoading } = useCart();
  const { user, status } = useAuth();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState<{ qrUrl: string; amount: number; txnRef: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  if (status === "loading" || isCartLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Đang tải...</div>;
  }

  if (items.length === 0 && !qrData) {
    router.push("/cart");
    return null;
  }

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
    } else if (!/^[0-9]{10,11}$/.test(phone.trim().replace(/\s+/g, ''))) {
      setPhoneError("Số điện thoại không hợp lệ (10-11 số)");
      hasError = true;
    }

    if (hasError) {
      toast.error("Vui lòng kiểm tra lại thông tin liên hệ");
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects 'vnpay', 'momo', 'bank_transfer'. We map 'visa' to 'vnpay'.
      const backendMethod = paymentMethod === "visa" ? "vnpay" : paymentMethod;

      const res: any = await orderApi.createOrder({
        fromCart: true,
        paymentMethod: backendMethod,
        customerName: name,
        customerPhone: phone,
      });

      // Clear local cart since it's converted to order
      await clearCart();

      if (res.payment && res.payment.method === "bank_transfer" && res.payment.qrUrl) {
        setQrData({
          qrUrl: res.payment.qrUrl,
          amount: res.payment.amount,
          txnRef: res.payment.txnRef,
        });
        toast.success("Đơn hàng đã được tạo. Vui lòng quét mã QR để thanh toán.");
      } else {
        toast.success("Đặt hàng thành công!");
        router.push("/profile");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tạo đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (qrData) {
    return (
      <main className="min-h-screen bg-background relative pt-24 pb-16 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Thanh toán đơn hàng</h2>
            <p className="text-muted-foreground mb-6">Mở ứng dụng ngân hàng và quét mã QR bên dưới.</p>
            
            <div className="bg-white p-4 rounded-2xl mx-auto inline-block border-2 border-primary/20 shadow-inner mb-6">
              <img src={qrData.qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-bold text-primary">{qrData.amount.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-bold">{qrData.txnRef}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                toast.success("Đơn hàng đang chờ xác nhận thanh toán.");
                router.push("/profile?tab=orders");
              }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Tôi đã thanh toán xong
            </button>
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
          {/* Form and Payment Selection */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Customer Info */}
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-1 transition-colors ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                    placeholder="Nhập họ và tên"
                  />
                  {nameError && <p className="text-red-500 text-sm mt-1.5 flex items-center"><span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>{nameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-1 transition-colors ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                    placeholder="Nhập số điện thoại"
                  />
                  {phoneError && <p className="text-red-500 text-sm mt-1.5 flex items-center"><span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>{phoneError}</p>}
                </div>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="sr-only" />
                  <QrCode className={`w-6 h-6 mr-4 ${paymentMethod === 'bank_transfer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold">Quét mã QR Ngân hàng</h3>
                    <p className="text-xs text-muted-foreground">Chuyển khoản nhanh qua VietQR (Khuyên dùng)</p>
                  </div>
                  {paymentMethod === 'bank_transfer' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'visa' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" name="payment" value="visa" checked={paymentMethod === 'visa'} onChange={() => setPaymentMethod('visa')} className="sr-only" />
                  <CreditCard className={`w-6 h-6 mr-4 ${paymentMethod === 'visa' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold">Thẻ Tín dụng / Ghi nợ quốc tế</h3>
                    <p className="text-xs text-muted-foreground">Thanh toán bằng thẻ Visa, Mastercard, JCB</p>
                  </div>
                  {paymentMethod === 'visa' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="sr-only" />
                  <Wallet className={`w-6 h-6 mr-4 ${paymentMethod === 'vnpay' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold">Thanh toán qua VNPAY</h3>
                    <p className="text-xs text-muted-foreground">Thẻ ATM nội địa hoặc tài khoản VNPay</p>
                  </div>
                  {paymentMethod === 'vnpay' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Chi tiết đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.courseId} className="flex gap-3">
                    <div className="relative w-20 h-14 rounded overflow-hidden shrink-0">
                      <Image src={item.thumbnail || "/auth-bg.jpg"} alt={item.courseName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm line-clamp-2 leading-tight">{item.courseName}</h4>
                      <p className="text-primary font-bold text-sm mt-1">{item.price.toLocaleString("vi-VN")} đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center text-sm mb-2 text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4 text-muted-foreground">
                  <span>Giảm giá</span>
                  <span>0 đ</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary text-2xl">{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Hoàn tất thanh toán"}
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Bằng việc hoàn tất thanh toán, bạn đồng ý với Điều khoản sử dụng của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

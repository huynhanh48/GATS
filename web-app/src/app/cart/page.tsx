"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media/url";
import { theme as designTheme } from "@/lib/theme";

export default function CartPage() {
  const { items, totalAmount, isLoading, removeFromCart } = useCart();

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative flex flex-col">
      <Header />

      <div className="w-full flex flex-col flex-1 relative z-10 bg-white min-h-[calc(100vh)]">
        {/* Breadcrumb Area */}
        <div
          className="w-full bg-[#f8f9fa] py-4 border-b border-border/10"
          style={{
            marginTop: `calc(${designTheme.layout.headerHeight} + 1px)`,
          }}
        >
          <Container size="xl">
            <div className="text-[1.3rem] font-medium text-slate-500 flex items-center gap-2">
              <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <span>›</span>
              <span className="text-slate-800">Giỏ hàng</span>
            </div>
          </Container>
        </div>

        <Container size="xl" className="py-12 md:py-16 flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-8">Giỏ hàng của bạn</h1>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải giỏ hàng...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex justify-center mb-6">
                <ShoppingCart className="w-24 h-24 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-6">Có vẻ như bạn chưa thêm khóa học nào vào giỏ hàng.</p>
              <Link href="/courses">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors">
                  Khám phá khóa học
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.courseId}
                    className="flex gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm items-center relative pr-12"
                  >
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <img
                        src={resolveMediaUrl(item.thumbnail)}
                        alt={item.courseName}
                        className="absolute inset-0 h-full w-full bg-muted p-1 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/800x800";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground line-clamp-2 leading-tight">
                        {item.courseName}
                      </h3>
                    </div>
                    <div className="font-bold text-primary whitespace-nowrap">
                      {item.price.toLocaleString("vi-VN")} đ
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="absolute right-4 text-muted-foreground hover:text-destructive transition-colors p-2"
                      aria-label="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Tổng cộng</h2>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-muted-foreground">Thành tiền:</span>
                    <span className="text-3xl font-black text-foreground">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <Link href="/checkout" className="block w-full">
                    <button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                      Thanh toán
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>

      <Footer />
    </main>
  );
}

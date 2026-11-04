"use client";

import { useCart } from "@/components/providers/CartProvider";
import { EdubostHeader as Header, EdubostFooter as Footer } from "@/components/edubost/EdubostShell";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media/url";
import "./cart.css";

export default function CartPage() {
  const { items, totalAmount, isLoading, removeFromCart } = useCart();

  return (
    <main className="body_wrap">
      <Header />

      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}>
        <div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Giỏ hàng</h1><p className="breadcrumb__desc">Kiểm tra các chương trình bạn đã chọn</p></div></div>
      </section>

      <section className="course-single edubost-cart pt-120 pb-120"><div className="container">
          <div className="section-title mb-60"><span className="sub-title">Chương trình đã chọn</span><h2 className="title">Giỏ hàng của bạn</h2></div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải giỏ hàng...</div>
          ) : items.length === 0 ? (
            <div className="cart-empty-state mission-vission-item text-center">
              <div className="cart-empty-state__icon flex justify-center mb-6">
                <ShoppingCart className="w-24 h-24 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-6">Có vẻ như bạn chưa thêm khóa học nào vào giỏ hàng.</p>
              <Link href="/courses" className="thm-btn">Khám phá khóa học <span><i className="far fa-arrow-right" /></span></Link>
            </div>
          ) : (
            <div className="row mt-none-30">
              <div className="col-lg-8 mt-30"><div className="course-single-content"><table><thead><tr><th>Khóa học</th><th>Học phí</th><th aria-label="Thao tác" /></tr></thead><tbody>
                {items.map((item) => (
                  <tr
                    key={item.courseId}
                  >
                    <td><div className="course-meta-author ul_li"><div className="xb-item--avatar">
                      <img
                        src={resolveMediaUrl(item.thumbnail)}
                        alt={item.courseName}
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/800x800";
                        }}
                      />
                    </div><div className="xb-item--holder"><h3 className="xb-item--desig">{item.courseName}</h3></div></div></td>
                    <td><strong>{item.price.toLocaleString("vi-VN")} đ</strong></td>
                    <td>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="xb-item--link"
                      aria-label="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    </td>
                  </tr>
                ))}
              </tbody></table></div></div>

              <div className="col-lg-4 mt-30">
                <div className="course-sidebar">
                  <h2 className="course-sidebar__title">Tổng cộng</h2>
                  <ul className="course-sidebar__list list-unstyled"><li><span>Thành tiền:</span><strong className="price">{totalAmount.toLocaleString("vi-VN")} đ</strong></li></ul>
                  <div className="sidebar-btn mt-35"><Link href="/checkout" className="thm-btn">Thanh toán <span><i className="far fa-arrow-right" /></span></Link></div>
                </div>
              </div>
            </div>
          )}
      </div></section>

      <Footer />
    </main>
  );
}

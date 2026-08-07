import React from 'react';
import { Metadata } from 'next';
import { EdubostHeader as Header, EdubostFooter as Footer } from '@/components/edubost/EdubostShell';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Không tìm thấy trang | GATS Academy',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
};

export default function NotFound() {
  return (
    <main className="body_wrap">
      <Header />
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}><div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Lỗi 404</h1><p className="breadcrumb__desc">Không tìm thấy trang bạn yêu cầu</p></div></div></section>
      <section className="about pt-120 pb-120"><div className="container text-center">

          <div className="relative w-full max-w-4xl aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] mb-12 mt-8">
            <Image
              src="/images/errors/icon-01.svg"
              alt="404 Error - Page Not Found"
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>

          <div className="about-content text-center">
            <p className="text-[1.6rem] text-slate-500 mb-8 max-w-2xl mx-auto">
              Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên, hoặc hiện tại không khả dụng.
            </p>
            <Link href="/" className="thm-btn">Quay lại Trang chủ <span><i className="far fa-arrow-right" /></span></Link>
          </div>
      </div></section>

      <Footer />
    </main>
  );
}

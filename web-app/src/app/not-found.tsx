import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import Image from 'next/image';
import { theme as designTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Không tìm thấy trang | GATS Academy',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
};

export default function NotFound() {
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
              <span className="text-slate-800">Lỗi 404</span>
            </div>
          </Container>
        </div>

        <Container size="xl" className="py-12 md:py-20 flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-160px)]">

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

          <div className="text-center">
            <p className="text-[1.6rem] text-slate-500 mb-8 max-w-2xl mx-auto">
              Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên, hoặc hiện tại không khả dụng.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-[#FF7622] hover:bg-[#FF7622]/90 text-white rounded-full px-8 text-[1.4rem] font-semibold h-14">
                Quay lại Trang chủ
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Footer />
    </main>
  );
}

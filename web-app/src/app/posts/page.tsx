import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PostsClient } from './PostsClient';
import { EdubostHeader as Header, EdubostFooter as Footer } from '@/components/edubost/EdubostShell';

export const metadata: Metadata = {
  title: 'Bài viết mới nhất | GATS Academy',
  description: 'Tổng hợp các bài viết, tin tức, và hướng dẫn mới nhất về AI, công cụ, tự động hóa từ GATS Academy.',
};

export default function PostsPage() {
  return (
    <main className="eb-page min-h-screen bg-background selection:bg-primary/30 relative">
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
            Đang tải bài viết…
          </div>
        }
      >
        <PostsClient />
      </Suspense>
      <Footer />
    </main>
  );
}

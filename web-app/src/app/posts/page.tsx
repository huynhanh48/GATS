import React from 'react';
import { Metadata } from 'next';
import { PostsClient } from './PostsClient';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Bài viết mới nhất | GATS Academy',
  description: 'Tổng hợp các bài viết, tin tức, và hướng dẫn mới nhất về AI, công cụ, tự động hóa từ GATS Academy.',
};

export default function PostsPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative">
      <Header />
      <PostsClient />
      <Footer />
    </main>
  );
}

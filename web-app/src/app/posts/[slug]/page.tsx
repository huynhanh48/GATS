import React from 'react';
import { Metadata } from 'next';
import { PostDetailClient } from './PostDetailClient';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ParticlesBackground } from '@/components/common/ParticlesBackground';
import { MOCK_POSTS } from '@/constants/mockPosts';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = MOCK_POSTS.find(p => p.slug === resolvedParams.slug);
  return {
    title: post ? `${post.title} | GATS Academy` : 'Bài viết | GATS Academy',
    description: post?.excerpt || 'Đọc bài viết mới nhất trên GATS Academy.',
  };
}

export default async function PostDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative">
      <ParticlesBackground id="post-detail-particles" />
      <Header />
      <PostDetailClient slug={resolvedParams.slug} />
      <Footer />
    </main>
  );
}

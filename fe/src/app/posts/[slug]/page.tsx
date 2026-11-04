import React from 'react';
import { Metadata } from 'next';
import { PostDetailClient } from './PostDetailClient';
import { EdubostHeader as Header, EdubostFooter as Footer } from '@/components/edubost/EdubostShell';

// Post slugs are managed in the admin and can be created after deployment.
// Keep this route dynamic so new linked posts resolve without a rebuild.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.slug} | GATS Academy`,
    description: 'Đọc bài viết trên GATS Academy.',
  };
}

export default async function PostDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <main className="eb-page min-h-screen bg-background selection:bg-primary/30 relative">
      <Header />
      <PostDetailClient slug={resolvedParams.slug} />
      <Footer />
    </main>
  );
}

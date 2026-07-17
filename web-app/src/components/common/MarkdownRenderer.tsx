'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Import highlight.js style for syntax highlighting
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper to convert text to URL-friendly slugs for HTML IDs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn(
      "prose prose-slate dark:prose-invert max-w-none",
      // Additional typography styles for modern looks
      "prose-headings:font-bold prose-headings:tracking-tight",
      "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-foreground",
      "prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-foreground",
      "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base md:prose-p:text-[1.125rem]",
      "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:bg-muted/44 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:my-8",
      "prose-img:rounded-[2rem] prose-img:my-12 prose-img:border prose-img:border-border/30 prose-img:shadow-lg prose-img:mx-auto",
      "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-muted-foreground",
      "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-muted-foreground",
      "prose-li:mb-3 prose-li:pl-1",
      "prose-pre:rounded-2xl prose-pre:border prose-pre:border-border/40 prose-pre:bg-zinc-950 prose-pre:p-4 prose-pre:shadow-md",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Generate IDs for h2 headings
          h2: ({ children, node, ...props }) => {
            const elementId = props.id || (node as any)?.properties?.id;
            const text = React.Children.toArray(children)
              .map(child => (typeof child === 'string' || typeof child === 'number' ? child : ''))
              .join('');
            const id = elementId || slugify(text) || `h2-${Math.random().toString(36).substr(2, 5)}`;
            return <h2 {...props} id={id}>{children}</h2>;
          },
          // Generate IDs for h3 headings
          h3: ({ children, node, ...props }) => {
            const elementId = props.id || (node as any)?.properties?.id;
            const text = React.Children.toArray(children)
              .map(child => (typeof child === 'string' || typeof child === 'number' ? child : ''))
              .join('');
            const id = elementId || slugify(text) || `h3-${Math.random().toString(36).substr(2, 5)}`;
            return <h3 {...props} id={id}>{children}</h3>;
          },
          // Optimize links: Use next/link for internal routing, target="_blank" for external links
          a: ({ href, children, ...props }) => {
            if (!href) return <a {...props}>{children}</a>;

            const isInternal = href.startsWith('/') || href.startsWith('#');

            if (isInternal) {
              return (
                <Link href={href} className="text-primary hover:underline" {...props}>
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

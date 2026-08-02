import type { NextConfig } from "next";

/**
 * Same-origin `/api/*` proxy target (browser → Next → BE).
 * Default loopback so local Docker / `next dev` hit the local BE, not api.gats.vn.
 * On gats.vn, nginx routes `/api` to BE before Next, so this rewrite is unused in prod.
 * Override with API_REWRITE_ORIGIN only if web and BE are not co-located.
 */
const apiRewriteOrigin = (
  process.env.API_REWRITE_ORIGIN ||
  process.env.NEXT_PUBLIC_API_REWRITE_ORIGIN ||
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/learning",
        destination: "/profile?tab=courses",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      // picsum redirects seed URLs → i.picsum.photos (must allow both)
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.viblo.asia",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      // MinIO / S3 public URLs (when thumbnails leave localhost)
      {
        protocol: "https",
        hostname: "api.gats.vn",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9010",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9010",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3-hn1-r1.longvan.net",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiRewriteOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

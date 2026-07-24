import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
    ],
  },
};

export default nextConfig;

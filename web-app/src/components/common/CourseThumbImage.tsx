"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/media/url";

const FALLBACK = "/edubost-reference/img/course/course_single.jpg";

type Props = {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
};

/** Standard <img> wrapper with resolveMediaUrl + graceful local fallback on error (avoids Next.js /_next/image origin restrictions). */
export function CourseThumbImage({
  src,
  alt,
  fill,
  className,
}: Props) {
  const resolved = resolveMediaUrl(src, FALLBACK);
  const [imgSrc, setImgSrc] = useState(resolved || FALLBACK);

  useEffect(() => {
    setImgSrc(resolveMediaUrl(src, FALLBACK) || FALLBACK);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt || "Hình ảnh khóa học"}
      className={fill ? `absolute inset-0 w-full h-full object-cover ${className || ""}` : className}
      onError={() => {
        if (imgSrc !== FALLBACK) {
          setImgSrc(FALLBACK);
        }
      }}
    />
  );
}

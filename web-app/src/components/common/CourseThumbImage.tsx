"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/media/url";

const FALLBACK = "https://placehold.co/800x450?text=Course";

type Props = {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
};

/** next/image with resolveMediaUrl + placehold fallback on load error. */
export function CourseThumbImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
}: Props) {
  const resolved = resolveMediaUrl(src, FALLBACK);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const current = failed ? FALLBACK : resolved;

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

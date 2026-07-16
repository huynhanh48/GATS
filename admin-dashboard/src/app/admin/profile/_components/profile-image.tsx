"use client";

import Image from "next/image";
import { UserIcon } from "./icons";

type ProfileImageUploaderProps = {
  initialImage: string | null;
  name: string;
};

export function ProfileImageUploader({
  initialImage,
  name,
}: ProfileImageUploaderProps) {
  return (
    <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
      <div className="relative flex items-center justify-center drop-shadow-2">
        {initialImage ? (
          <Image
            src={initialImage}
            width={160}
            height={160}
            className="size-28 overflow-hidden rounded-full object-cover sm:size-40"
            alt={`${name} profile image`}
          />
        ) : (
          <span className="mx-auto flex size-40 items-center justify-center gap-2.5 rounded-full bg-white px-2.5 py-2.25">
            <UserIcon className="size-1/2" />
          </span>
        )}
      </div>
    </div>
  );
}

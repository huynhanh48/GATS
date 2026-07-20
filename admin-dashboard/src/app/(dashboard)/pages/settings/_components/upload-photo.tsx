"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { UserIcon } from "./icons";

type UploadPhotoFormProps = {
  initialImage: string | null;
};

export function UploadPhotoForm({ initialImage }: UploadPhotoFormProps) {
  return (
    <ShowcaseSection title="Your Photo" className="p-7!">
      <p className="mb-5 text-sm text-dark-4 dark:text-dark-6">
        Chức năng cập nhật ảnh đại diện đang phát triển.
      </p>
      <div className="mb-4 flex items-center gap-3">
        {initialImage ? (
          <Image
            src={initialImage}
            width={55}
            height={55}
            alt="User photo"
            className="size-14 rounded-full object-cover"
            quality={90}
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-2 text-dark dark:bg-dark-2 dark:text-white">
            <UserIcon className="size-7" />
          </div>
        )}

        <div>
          <span className="mb-1.5 font-medium text-dark dark:text-white">
            Ảnh đại diện
          </span>
          <span className="text-body-sm text-dark-4 dark:text-dark-6">
            Chưa hỗ trợ cập nhật
          </span>
        </div>
      </div>
    </ShowcaseSection>
  );
}

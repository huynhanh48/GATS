import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { getAdminSession } from "@/lib/api/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PersonalInfoForm } from "./_components/personal-info";
import { UploadPhotoForm } from "./_components/upload-photo";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default async function SettingsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/auth/sign-in?error=unauthorized");
  }

  const { user } = session;

  return (
    <div className="mx-auto w-full max-w-270">
      <AdminPageHeader
        eyebrow="Account"
        title="Settings"
        description="Quản lý thông tin tài khoản, ảnh đại diện và dữ liệu hồ sơ của admin."
        className="mb-6"
      />

      <div className="grid grid-cols-5 gap-5 xl:gap-6">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm
            name={user.name}
            email={user.email}
            bio="Chức năng cập nhật hồ sơ đang phát triển"
          />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm initialImage={user.image} />
        </div>
      </div>
    </div>
  );
}

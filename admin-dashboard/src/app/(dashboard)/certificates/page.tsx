import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCertificates } from "./actions";
import { CertificateManager } from "./_components/certificate-manager";

export const metadata: Metadata = {
  title: "Chứng chỉ",
};

type PageProps = {
  searchParams: Promise<{ issueUser?: string; issueCourse?: string }>;
};

export default async function CertificatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const prefillUserId = Number(params.issueUser);
  const prefillCourseId = params.issueCourse?.trim() || undefined;

  const { data: certificates, pagination } = await fetchCertificates({
    limit: 100,
  });
  const issued = certificates.filter((c) => c.status === "issued").length;
  const revoked = certificates.filter((c) => c.status === "revoked").length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Học tập"
        title="Chứng chỉ"
        description="Chứng chỉ được tự động cấp khi học viên hoàn thành 100% khóa học, hoặc cấp thủ công tại đây."
        metrics={[
          { label: "Tổng số", value: pagination.total, tone: "slate" },
          { label: "Đang hiệu lực", value: issued, tone: "green" },
          { label: "Đã thu hồi", value: revoked, tone: "orange" },
        ]}
      />
      <CertificateManager
        certificates={certificates}
        prefillUserId={
          Number.isFinite(prefillUserId) && prefillUserId > 0
            ? prefillUserId
            : undefined
        }
        prefillCourseId={prefillCourseId}
      />
    </div>
  );
}

import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";

export type MyCertificate = {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string | null;
  courseSlug: string | null;
  status: "issued" | "revoked";
  issuedAt: string;
};

export async function fetchMyCertificates(): Promise<MyCertificate[]> {
  const res: any = await apiClient.get(PathApi.certificate.mine);
  return Array.isArray(res?.data) ? res.data : [];
}

export type CertificateVerification = {
  certificateNumber: string;
  status: "issued" | "revoked";
  issuedAt: string;
  revokedAt: string | null;
  courseTitle: string | null;
  holderName: string | null;
};

export async function verifyCertificate(
  certificateNumber: string,
): Promise<CertificateVerification | null> {
  try {
    const res: any = await apiClient.get(
      PathApi.certificate.verify(certificateNumber),
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

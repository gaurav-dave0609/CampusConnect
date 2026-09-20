import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/rbac";
import { OfficerApplicationsPipeline } from "@/components/placement/officer-applications-pipeline";

export const metadata = {
  title: "Candidate Recruitment Pipeline | Campus Connect",
  description: "Cross-drive applicant screening, status transitions, and audit records.",
};

export default async function OfficerApplicationsPage() {
  await requireRole([Role.PLACEMENT_OFFICER, Role.ADMIN]);
  return <OfficerApplicationsPipeline />;
}

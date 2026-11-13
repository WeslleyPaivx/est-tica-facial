import type { Metadata } from "next";
import { requireOrgSession, can } from "@/server/session";
import { loadDashboard } from "@/server/dashboard";
import { AuditList } from "@/components/organizations/audit-list";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Visão geral" };

export default async function OverviewPage() {
  const s = await requireOrgSession();
  const d = await loadDashboard(s);
  return (
    <DashboardView
      d={d}
      firstName={(s.user.fullName || s.user.email.split("@")[0] || "").split(" ")[0] || "você"}
      orgName={s.active.organization.name}
      role={s.active.role}
      mfaOn={s.aal.current === "aal2"}
      canWrite={{ contacts: can(s, "contacts.write"), companies: can(s, "companies.write") }}
      activity={can(s, "audit.read") ? <AuditList organizationId={s.active.organization_id} limit={5} compact /> : undefined}
    />
  );
}

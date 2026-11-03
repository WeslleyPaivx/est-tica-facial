import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/design-system/components/layout";
import { AuditList } from "@/components/organizations/audit-list";
import { can, requireOrgSession } from "@/server/session";

export const metadata: Metadata = { title: "Auditoria" };

export default async function AuditPage() {
  const s = await requireOrgSession();
  if (!can(s, "audit.read")) redirect("/");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Auditoria" description="Últimos 200 eventos administrativos. Registros não podem ser alterados pelo app." />
      <AuditList organizationId={s.active.organization_id} limit={200} />
    </div>
  );
}

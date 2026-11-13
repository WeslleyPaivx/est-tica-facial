import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/design-system/components/layout";
import { CompanyForm } from "@/components/crm/crm-forms";
import { can, requireOrgSession } from "@/server/session";

export const metadata: Metadata = { title: "Nova empresa" };

export default async function NewCompanyPage() {
  const s = await requireOrgSession();
  if (!can(s, "companies.write")) redirect("/companies");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Nova empresa" />
      <CompanyForm values={{ request_id: randomUUID(), name: "", email: null, phone: null, website: null, notes: null }} readOnly={false} />
    </div>
  );
}

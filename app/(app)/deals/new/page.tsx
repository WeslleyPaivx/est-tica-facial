import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/design-system/components/layout";
import { DealForm } from "@/components/deals/deal-form";
import { can, requireOrgSession } from "@/server/session";
import { dealFormOptions } from "@/server/deal-options";

export const metadata: Metadata = { title: "Nova oportunidade" };

export default async function NewDealPage() {
  const s = await requireOrgSession();
  if (!can(s, "deals.write")) redirect("/deals");
  const o = await dealFormOptions(s);
  if (!o.pipeline || o.stages.length === 0) redirect("/deals");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Nova oportunidade" description="Um lead novo entra na primeira etapa; ajuste se ele já estiver mais adiante." />
      <DealForm
        values={{ request_id: randomUUID(), title: "", value_cents: null, source: null, stage_id: o.stages[0]!.id, contact_id: null, company_id: null, owner_id: s.user.id, next_action: null, next_action_at: null }}
        stages={o.stages} contacts={o.contacts} companies={o.companies} owners={o.owners} readOnly={false}
      />
    </div>
  );
}

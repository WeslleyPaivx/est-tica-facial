import "server-only";
import type { OrgSession } from "@/server/session";
import { contactFormOptions } from "@/server/crm";
import { defaultPipeline } from "@/server/deals";

// Opções dos selects do formulário de oportunidade, sempre da organização ativa.
// shortcut: até 500 contatos num <select>; trocar por busca assíncrona quando passar disso.
export async function dealFormOptions(s: OrgSession) {
  const [base, pipeline, { data: contacts }] = await Promise.all([
    contactFormOptions(s),
    defaultPipeline(s),
    s.supabase.from("contacts").select("id, full_name").eq("organization_id", s.active.organization_id).order("full_name").limit(500),
  ]);
  return {
    pipeline,
    stages: (pipeline?.stages ?? []).map((st) => ({ id: st.id, label: st.name })),
    contacts: (contacts ?? []).map((c: { id: string; full_name: string }) => ({ id: c.id, label: c.full_name })),
    companies: base.companies,
    owners: base.owners,
  };
}

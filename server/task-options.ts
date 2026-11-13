import "server-only";
import { can, type OrgSession } from "@/server/session";
import { contactFormOptions } from "@/server/crm";

// Opções dos selects do formulário de tarefa, sempre da organização ativa.
// shortcut: até 500 contatos e 500 oportunidades num <select>; trocar por busca assíncrona quando passar disso.
export async function taskFormOptions(s: OrgSession) {
  const orgId = s.active.organization_id;
  const [base, { data: contacts }, { data: deals }] = await Promise.all([
    contactFormOptions(s),
    s.supabase.from("contacts").select("id, full_name").eq("organization_id", orgId).order("full_name").limit(500),
    can(s, "deals.read")
      ? s.supabase.from("deals").select("id, title").eq("organization_id", orgId).eq("status", "open").order("updated_at", { ascending: false }).limit(500)
      : Promise.resolve({ data: [] }),
  ]);
  return {
    owners: base.owners,
    companies: base.companies,
    contacts: (contacts ?? []).map((c: { id: string; full_name: string }) => ({ id: c.id, label: c.full_name })),
    deals: (deals ?? []).map((d: { id: string; title: string }) => ({ id: d.id, label: d.title })),
  };
}

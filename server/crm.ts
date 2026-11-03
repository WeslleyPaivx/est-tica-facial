import "server-only";
import type { OrgSession } from "@/server/session";

type Option = { id: string; label: string };

// Opções do formulário de contato, sempre da organização ativa (RLS + filtro explícito).
// shortcut: carrega até 500 empresas num <select>; trocar por busca assíncrona quando passar disso.
export async function contactFormOptions(s: OrgSession): Promise<{ companies: Option[]; owners: Option[] }> {
  const orgId = s.active.organization_id;
  const [{ data: companies }, { data: members }] = await Promise.all([
    s.supabase.from("companies").select("id, name").eq("organization_id", orgId).order("name").limit(500),
    s.supabase.from("organization_members").select("user_id").eq("organization_id", orgId),
  ]);
  const ids = (members ?? []).map((m: { user_id: string }) => m.user_id);
  const { data: profiles } = ids.length ? await s.supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] };
  return {
    companies: (companies ?? []).map((c: { id: string; name: string }) => ({ id: c.id, label: c.name })),
    owners: (profiles ?? []).map((p: { id: string; full_name: string }) => ({ id: p.id, label: p.full_name || "Sem nome" })),
  };
}

// Nomes para exibição em listas (empresas e responsáveis), restritos ao que o RLS permite ler.
export async function nameMaps(s: OrgSession, companyIds: string[], ownerIds: string[]) {
  const [{ data: companies }, { data: profiles }] = await Promise.all([
    companyIds.length ? s.supabase.from("companies").select("id, name").in("id", companyIds) : Promise.resolve({ data: [] }),
    ownerIds.length ? s.supabase.from("profiles").select("id, full_name").in("id", ownerIds) : Promise.resolve({ data: [] }),
  ]);
  return {
    company: new Map((companies ?? []).map((c: { id: string; name: string }) => [c.id, c.name])),
    owner: new Map((profiles ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name])),
  };
}

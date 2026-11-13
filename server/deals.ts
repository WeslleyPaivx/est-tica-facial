import "server-only";
import type { OrgSession } from "@/server/session";
import { nameMaps } from "@/server/crm";
import type { DealStatus } from "@/features/crm/deals";

// Leitura do funil sob RLS, sempre filtrada pela organização ativa. DTOs só com o que as telas mostram.

export type Stage = { id: string; name: string; position: number };
export type DealCard = {
  id: string;
  title: string;
  value_cents: number | null;
  stage_id: string;
  status: DealStatus;
  next_action: string | null;
  next_action_at: string | null;
  contact: string | null;
  company: string | null;
  owner: string | null;
  updated_at: string;
};

const DEAL_COLS = "id, title, value_cents, stage_id, status, next_action, next_action_at, contact_id, company_id, owner_id, updated_at";
type DealRow = {
  id: string; title: string; value_cents: number | null; stage_id: string; status: DealStatus; next_action: string | null;
  next_action_at: string | null; contact_id: string | null; company_id: string | null; owner_id: string | null; updated_at: string;
};

export async function defaultPipeline(s: OrgSession) {
  const orgId = s.active.organization_id;
  const { data: pipeline } = await s.supabase.from("pipelines").select("id, name").eq("organization_id", orgId).eq("is_default", true).maybeSingle();
  if (!pipeline) return null;
  const { data: stages } = await s.supabase
    .from("pipeline_stages").select("id, name, position").eq("organization_id", orgId).eq("pipeline_id", pipeline.id).order("position");
  return { id: pipeline.id as string, name: pipeline.name as string, stages: (stages ?? []) as Stage[] };
}

// shortcut: até 500 oportunidades por consulta no quadro; paginar por coluna quando passar disso
export async function loadBoard(s: OrgSession, opts: { status: DealStatus; mine: boolean; q: string }) {
  const pipeline = await defaultPipeline(s);
  if (!pipeline) return null;
  let query = s.supabase
    .from("deals").select(DEAL_COLS)
    .eq("organization_id", s.active.organization_id).eq("pipeline_id", pipeline.id).eq("status", opts.status)
    .order("updated_at", { ascending: false }).limit(500);
  if (opts.mine) query = query.eq("owner_id", s.user.id);
  if (opts.q) query = query.ilike("title", `%${opts.q}%`);
  const { data, error } = await query;
  const rows = (data ?? []) as DealRow[];
  return { pipeline, deals: await toCards(s, rows), failed: Boolean(error) };
}

async function toCards(s: OrgSession, rows: DealRow[]): Promise<DealCard[]> {
  const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((v): v is string => Boolean(v)))];
  const contactIds = uniq(rows.map((r) => r.contact_id));
  const [names, { data: contacts }] = await Promise.all([
    nameMaps(s, uniq(rows.map((r) => r.company_id)), uniq(rows.map((r) => r.owner_id))),
    contactIds.length ? s.supabase.from("contacts").select("id, full_name").in("id", contactIds) : Promise.resolve({ data: [] }),
  ]);
  const contact = new Map((contacts ?? []).map((c: { id: string; full_name: string }) => [c.id, c.full_name]));
  return rows.map((r) => ({
    id: r.id, title: r.title, value_cents: r.value_cents, stage_id: r.stage_id, status: r.status, next_action: r.next_action,
    next_action_at: r.next_action_at, updated_at: r.updated_at,
    contact: r.contact_id ? contact.get(r.contact_id) ?? null : null,
    company: r.company_id ? names.company.get(r.company_id) ?? null : null,
    owner: r.owner_id ? names.owner.get(r.owner_id) || "Sem nome" : null,
  }));
}

export async function loadDeal(s: OrgSession, id: string) {
  const { data } = await s.supabase
    .from("deals")
    .select("id, title, value_cents, source, stage_id, status, lost_reason, next_action, next_action_at, contact_id, company_id, owner_id, created_at, closed_at")
    .eq("id", id).eq("organization_id", s.active.organization_id).maybeSingle();
  if (!data) return null;
  const { data: events } = await s.supabase
    .from("deal_events").select("id, kind, from_stage, to_stage, from_status, to_status, actor_id, created_at")
    .eq("deal_id", id).eq("organization_id", s.active.organization_id).order("created_at", { ascending: false }).limit(50);
  const actors = [...new Set((events ?? []).map((e: { actor_id: string | null }) => e.actor_id).filter((v): v is string => Boolean(v)))];
  const names = await nameMaps(s, [], actors);
  return {
    deal: data as {
      id: string; title: string; value_cents: number | null; source: string | null; stage_id: string; status: DealStatus;
      lost_reason: string | null; next_action: string | null; next_action_at: string | null; contact_id: string | null;
      company_id: string | null; owner_id: string | null; created_at: string; closed_at: string | null;
    },
    events: (events ?? []).map((e: {
      id: number; kind: string; from_stage: string | null; to_stage: string | null; from_status: DealStatus | null;
      to_status: DealStatus | null; actor_id: string | null; created_at: string;
    }) => ({ ...e, actor: e.actor_id ? names.owner.get(e.actor_id) || "Sem nome" : "Sistema" })),
  };
}

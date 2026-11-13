import "server-only";
import { can, type OrgSession } from "@/server/session";
import { nameMaps } from "@/server/crm";
import { ROLES, type Role } from "@/lib/security/permissions";

// Dados do painel inicial. Tudo sai de consultas reais sob RLS, da organização ativa; nada é inventado.
// DTO só com o que a tela mostra (nenhum e-mail, telefone ou id de usuário vai ao navegador além do necessário).

export type DailyPoint = { day: string; contacts: number; companies: number };
export type Recent = { id: string; kind: "contact" | "company"; name: string; createdAt: string };

type Summary = {
  daily: [string, number, number][];
  before: { contacts: number; companies: number };
  quality: { total: number; email: number; phone: number; company: number; owner: number };
  owners: { id: string | null; n: number }[];
};

export async function loadDashboard(s: OrgSession) {
  const orgId = s.active.organization_id;
  const canContacts = can(s, "contacts.read");
  const canCompanies = can(s, "companies.read");
  const canMembers = can(s, "members.read");

  const [summaryRes, contactsRes, companiesRes, membersRes, invitesRes] = await Promise.all([
    canContacts || canCompanies ? s.supabase.rpc("dashboard_summary", { p_org: orgId }) : Promise.resolve({ data: null, error: null }),
    canContacts
      ? s.supabase.from("contacts").select("id, full_name, created_at").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] }),
    canCompanies
      ? s.supabase.from("companies").select("id, name, created_at").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] }),
    canMembers ? s.supabase.from("organization_members").select("role").eq("organization_id", orgId) : Promise.resolve({ data: null }),
    can(s, "members.invite")
      ? s.supabase
          .from("organization_invitations")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
      : Promise.resolve({ count: null }),
  ]);

  const summary = (summaryRes.data ?? null) as Summary | null;
  const daily: DailyPoint[] = (summary?.daily ?? []).map(([day, contacts, companies]) => ({ day, contacts, companies }));

  const ownerRows = summary?.owners ?? [];
  const names = (await nameMaps(s, [], ownerRows.flatMap((o) => (o.id ? [o.id] : [])))).owner;
  const owners = ownerRows.map((o) => ({
    label: o.id ? names.get(o.id) || "Sem nome" : "Sem responsável",
    isMe: o.id === s.user.id,
    n: o.n,
  }));

  const recent: Recent[] = [
    ...((contactsRes.data ?? []) as { id: string; full_name: string; created_at: string }[]).map((c) => ({
      id: c.id, kind: "contact" as const, name: c.full_name, createdAt: c.created_at,
    })),
    ...((companiesRes.data ?? []) as { id: string; name: string; created_at: string }[]).map((c) => ({
      id: c.id, kind: "company" as const, name: c.name, createdAt: c.created_at,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const roles = membersRes.data
    ? Object.fromEntries(ROLES.map((r) => [r, (membersRes.data as { role: Role }[]).filter((m) => m.role === r).length])) as Record<Role, number>
    : null;

  const contactsTotal = summary ? summary.before.contacts + daily.reduce((t, d) => t + d.contacts, 0) : 0;
  const companiesTotal = summary ? summary.before.companies + daily.reduce((t, d) => t + d.companies, 0) : 0;

  return {
    failed: Boolean(summaryRes.error),
    canContacts,
    canCompanies,
    daily,
    before: summary?.before ?? { contacts: 0, companies: 0 },
    totals: { contacts: contactsTotal, companies: companiesTotal },
    quality: summary?.quality ?? { total: 0, email: 0, phone: 0, company: 0, owner: 0 },
    owners,
    recent,
    team: roles ? { roles, total: Object.values(roles).reduce((t, n) => t + n, 0), invites: invitesRes.count ?? null } : null,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRole, requiresMfa } from "@/lib/security/permissions";
import type { Membership, Organization } from "@/types/domain";

export const ACTIVE_ORG_COOKIE = "zaniva_org";

type MembershipRow = { id: string; organization_id: string; role: string; organizations: Organization | null };

// cache() do React é por requisição: não compartilha dados entre usuários/tenants.
export const getSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  // getUser valida o JWT no servidor de Auth (detecta sessão revogada/expirada).
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const [{ data: aal }, { data: rows }, cookieStore] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase
      .from("organization_members")
      .select("id, organization_id, role, organizations(id, name, slug, status)")
      .eq("user_id", user.id)
      .order("created_at"),
    cookies(),
  ]);

  const memberships: Membership[] = ((rows ?? []) as unknown as MembershipRow[])
    .filter((r) => r.organizations && isRole(r.role))
    .map((r) => ({
      id: r.id,
      organization_id: r.organization_id,
      role: r.role as Membership["role"],
      organization: r.organizations as Organization,
    }));

  // O cookie é só uma preferência: vale apenas se corresponder a uma membership real.
  const hint = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active = memberships.find((m) => m.organization_id === hint) ?? memberships[0] ?? null;

  let permissions: string[] = [];
  if (active) {
    const { data } = await supabase.rpc("my_permissions", { p_org: active.organization_id });
    permissions = Array.isArray(data) ? (data as string[]) : [];
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? "",
      emailVerified: Boolean(user.email_confirmed_at),
      fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "",
    },
    aal: { current: aal?.currentLevel ?? "aal1", next: aal?.nextLevel ?? "aal1" },
    memberships,
    active,
    permissions,
  };
});

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type OrgSession = Session & { active: Membership };

export function needsMfa(s: Session): boolean {
  if (s.aal.current === "aal2") return false;
  return s.aal.next === "aal2" || Boolean(s.active && requiresMfa(s.active.role));
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requireOrgSession(): Promise<OrgSession> {
  const s = await requireSession();
  if (!s.active) redirect("/onboarding");
  if (needsMfa(s)) redirect("/mfa");
  return s as OrgSession;
}

export function can(s: Session, permission: string): boolean {
  return s.permissions.includes(permission);
}

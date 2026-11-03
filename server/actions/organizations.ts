"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ACTIVE_ORG_COOKIE, getSession, needsMfa } from "@/server/session";
import { safeDbMessage } from "@/lib/security/errors";
import { createOrgSchema, idSchema, inviteSchema, memberRoleSchema, orgNameSchema } from "@/features/organizations/schemas";
import type { ActionState } from "@/types/domain";

async function setActiveOrg(orgId: string) {
  (await cookies()).set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

// Toda ação revalida a sessão no servidor; a organização ativa vem da membership real, nunca do formulário.
async function authed() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

async function authedOrg() {
  const s = await authed();
  if (!s.active) redirect("/onboarding");
  if (needsMfa(s)) redirect("/mfa");
  return { ...s, active: s.active };
}

export async function createOrganizationAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await authed();
  const parsed = createOrgSchema.safeParse({ name: form.get("name"), slug: form.get("slug") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { data, error } = await s.supabase.rpc("create_organization", { p_name: parsed.data.name, p_slug: parsed.data.slug });
  if (error || typeof data !== "string") return { error: safeDbMessage(error) };
  await setActiveOrg(data);
  redirect("/");
}

export async function switchOrganizationAction(form: FormData): Promise<void> {
  const s = await authed();
  const orgId = idSchema.safeParse(form.get("organizationId"));
  if (orgId.success && s.memberships.some((m) => m.organization_id === orgId.data)) await setActiveOrg(orgId.data);
  redirect("/");
}

export async function acceptInvitationAction(form: FormData): Promise<void> {
  const s = await authed();
  const id = idSchema.safeParse(form.get("invitationId"));
  if (!id.success) redirect("/onboarding?error=invite");
  const { data, error } = await s.supabase.rpc("accept_invitation", { p_invitation: id.data });
  if (error || typeof data !== "string") redirect("/onboarding?error=invite");
  await setActiveOrg(data);
  redirect("/");
}

export async function renameOrganizationAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await authedOrg();
  const parsed = orgNameSchema.safeParse(form.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { data, error } = await s.supabase
    .from("organizations")
    .update({ name: parsed.data })
    .eq("id", s.active.organization_id)
    .select("id");
  if (error || !data?.length) return { error: safeDbMessage(error ?? { code: "42501" }) };
  revalidatePath("/", "layout");
  return { ok: true, message: "Organização atualizada." };
}

export async function inviteMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await authedOrg();
  const parsed = inviteSchema.safeParse({ email: form.get("email"), role: form.get("role") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { error } = await s.supabase.rpc("invite_member", {
    p_org: s.active.organization_id,
    p_email: parsed.data.email,
    p_role: parsed.data.role,
  });
  if (error) return { error: safeDbMessage(error) };
  revalidatePath("/settings/members");
  return {
    ok: true,
    message: "Convite registrado. O envio de e-mail ainda não está configurado: peça à pessoa para entrar com este e-mail e aceitar o convite.",
  };
}

export async function revokeInvitationAction(form: FormData): Promise<void> {
  const s = await authedOrg();
  const id = idSchema.safeParse(form.get("invitationId"));
  if (id.success) await s.supabase.rpc("revoke_invitation", { p_invitation: id.data });
  revalidatePath("/settings/members");
}

export async function updateMemberRoleAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await authedOrg();
  const parsed = memberRoleSchema.safeParse({ memberId: form.get("memberId"), role: form.get("role") });
  if (!parsed.success) return { error: "Dados inválidos." };
  const { error } = await s.supabase.rpc("update_member_role", { p_member: parsed.data.memberId, p_role: parsed.data.role });
  if (error) return { error: safeDbMessage(error) };
  revalidatePath("/settings/members");
  return { ok: true, message: "Papel atualizado." };
}

export async function removeMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await authedOrg();
  const id = idSchema.safeParse(form.get("memberId"));
  if (!id.success) return { error: "Dados inválidos." };
  const { error } = await s.supabase.rpc("remove_member", { p_member: id.data });
  if (error) return { error: safeDbMessage(error) };
  if (id.data === s.active.id) {
    (await cookies()).delete(ACTIVE_ORG_COOKIE);
    redirect("/");
  }
  revalidatePath("/settings/members");
  return { ok: true, message: "Membro removido." };
}

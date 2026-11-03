"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeNextPath } from "@/lib/security/redirect";
import { emailSchema, newPasswordSchema, signInSchema, signUpSchema } from "@/features/auth/schemas";
import type { ActionState } from "@/types/domain";

const firstIssue = (e: { issues: { message: string }[] }) => e.issues[0]?.message ?? "Dados inválidos.";

export async function signInAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // mensagem genérica: não revela se o e-mail existe
  if (error) return { error: "E-mail ou senha inválidos, ou e-mail ainda não confirmado." };
  redirect(safeNextPath(String(form.get("next") ?? ""), "/"));
}

export async function signUpAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/onboarding`,
    },
  });
  if (error && error.status !== 422) {
    console.error("signUp failed", { status: error.status, code: error.code });
    return { error: "Não foi possível criar a conta agora. Tente novamente." };
  }
  return { ok: true, message: "Se o e-mail puder ser usado, enviamos um link de confirmação." };
}

export async function requestPasswordResetAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
  });
  return { ok: true, message: "Se houver uma conta para este e-mail, enviamos as instruções." };
}

export async function updatePasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({ password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sessão expirada. Solicite um novo link." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Não foi possível alterar a senha. Se você usa MFA, verifique o código primeiro." };
  // encerra as demais sessões após troca de senha
  await supabase.auth.signOut({ scope: "others" });
  return { ok: true, message: "Senha alterada. Outras sessões foram encerradas." };
}

export async function signOutAction(form: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: form.get("scope") === "global" ? "global" : "local" });
  redirect("/login");
}

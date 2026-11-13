"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { totpSchema } from "@/features/auth/schemas";
import type { ActionState } from "@/types/domain";

export type EnrollState = ActionState & { factorId?: string; qrCode?: string; secret?: string };

export async function enrollTotpAction(): Promise<EnrollState> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Sessão expirada." };

  // remove fatores TOTP pendentes (não verificados) de tentativas anteriores
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Zaniva CRM",
    friendlyName: `Autenticador ${new Date().toISOString().slice(0, 10)}`,
  });
  if (error || !data) return { error: "Não foi possível iniciar o cadastro do autenticador." };
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotpAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = totpSchema.safeParse({ factorId: form.get("factorId"), code: form.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Código inválido." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: "Código inválido ou expirado." };
  redirect("/");
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthLayout from "../(auth)/layout";
import { EnrollFactor, VerifyFactor } from "@/components/mfa/mfa-forms";
import { requireSession } from "@/server/session";
import { requiresMfa } from "@/lib/security/permissions";
import { signOutAction } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Verificação em duas etapas" };

export default async function MfaPage() {
  const s = await requireSession();
  if (s.aal.current === "aal2") redirect("/");
  const { data } = await s.supabase.auth.mfa.listFactors();
  const factor = data?.totp?.find((f) => f.status === "verified");
  const mandatory = Boolean(s.active && requiresMfa(s.active.role));

  return (
    <AuthLayout>
      <h1 className="mb-1 text-base font-semibold">Verificação em duas etapas</h1>
      <p className="mb-5 text-[13px] text-muted">
        {factor
          ? "Informe o código do seu autenticador para continuar."
          : mandatory
            ? "Proprietários e administradores precisam de MFA para acessar os dados da organização."
            : "Proteja sua conta com um aplicativo autenticador."}
      </p>
      {factor ? <VerifyFactor factorId={factor.id} /> : <EnrollFactor />}
      <div className="mt-5 flex justify-between text-[13px] text-muted">
        {!mandatory && !factor ? <Link href="/" className="hover:text-fg">Agora não</Link> : <span />}
        <form action={signOutAction}>
          <button type="submit" className="hover:text-fg">Sair</button>
        </form>
      </div>
    </AuthLayout>
  );
}

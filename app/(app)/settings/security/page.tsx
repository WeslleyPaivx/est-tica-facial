import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Badge } from "@/design-system/components/feedback";
import { Button, buttonClass } from "@/design-system/components/button";
import { requireOrgSession } from "@/server/session";
import { signOutAction } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Segurança" };

export default async function SecurityPage() {
  const s = await requireOrgSession();
  const { data } = await s.supabase.auth.mfa.listFactors();
  const verified = (data?.totp ?? []).filter((f) => f.status === "verified");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Segurança da conta" description={s.user.email} />
      <Section title="Verificação em duas etapas" description="Aplicativo autenticador (TOTP).">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge tone={verified.length ? "success" : "warning"}>{verified.length ? "Ativa" : "Inativa"}</Badge>
            <span className="text-muted">Sessão atual: {s.aal.current === "aal2" ? "verificada com MFA" : "somente senha"}</span>
          </div>
          {!verified.length ? <Link href="/mfa" className={buttonClass("secondary", "sm")}>Configurar</Link> : null}
        </div>
      </Section>
      <Section title="Sessões" description="Encerre o acesso em todos os dispositivos, inclusive este.">
        <form action={signOutAction}>
          <input type="hidden" name="scope" value="global" />
          <Button type="submit" variant="danger">Encerrar todas as sessões</Button>
        </form>
      </Section>
    </div>
  );
}

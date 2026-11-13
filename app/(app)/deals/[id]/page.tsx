import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Badge } from "@/design-system/components/feedback";
import { CloseDeal, DealForm, DeleteDeal } from "@/components/deals/deal-form";
import { can, requireOrgSession } from "@/server/session";
import { loadDeal } from "@/server/deals";
import { dealFormOptions } from "@/server/deal-options";
import { idSchema } from "@/features/organizations/schemas";
import { DEAL_STATUS_LABEL, formatCents } from "@/features/crm/deals";

export const metadata: Metadata = { title: "Oportunidade" };

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "deals.read")) redirect("/");
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const [found, o] = await Promise.all([loadDeal(s, id.data), dealFormOptions(s)]);
  if (!found) notFound(); // id de outra organização ou inexistente: mesma resposta
  const { deal, events } = found;
  const canWrite = can(s, "deals.write");
  const stageName = (sid: string | null) => o.stages.find((st) => st.id === sid)?.label ?? "etapa removida";
  const describe = (e: (typeof events)[number]) =>
    e.kind === "created" ? `Criada em ${stageName(e.to_stage)}`
      : e.kind === "stage_changed" ? `Movida de ${stageName(e.from_stage)} para ${stageName(e.to_stage)}`
        : `Situação: ${DEAL_STATUS_LABEL[e.from_status ?? "open"]} → ${DEAL_STATUS_LABEL[e.to_status ?? "open"]}`;
  const tone = deal.status === "won" ? "success" : deal.status === "lost" ? "danger" : "neutral";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={deal.title}
        description={[deal.value_cents !== null ? formatCents(deal.value_cents) : null, deal.status === "open" ? stageName(deal.stage_id) : null].filter(Boolean).join(" · ") || undefined}
        actions={<Badge tone={tone}>{DEAL_STATUS_LABEL[deal.status]}</Badge>}
      />
      {deal.status === "lost" && deal.lost_reason ? <p className="text-sm text-muted">Motivo da perda: {deal.lost_reason}</p> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <DealForm values={deal} stages={o.stages} contacts={o.contacts} companies={o.companies} owners={o.owners} readOnly={!canWrite} />
        <div className="flex flex-col gap-6">
          {canWrite ? <Section title="Fechamento"><CloseDeal id={deal.id} status={deal.status} /></Section> : null}
          <Section title="Histórico">
            <ol className="flex flex-col gap-3 text-sm">
              {events.map((e) => (
                <li key={e.id}>
                  <p>{describe(e)}</p>
                  <p className="text-xs text-muted">{e.actor} · {fmt.format(new Date(e.created_at))}</p>
                </li>
              ))}
            </ol>
          </Section>
          {can(s, "deals.delete") ? <Section title="Excluir"><DeleteDeal id={deal.id} title={deal.title} /></Section> : null}
        </div>
      </div>
    </div>
  );
}

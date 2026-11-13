import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/design-system/components/layout";
import { EmptyState } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { cx } from "@/design-system/components/cx";
import { Table, Td, Th } from "@/design-system/components/table";
import { SearchForm } from "@/components/crm/list-controls";
import { DealBoard } from "@/components/deals/board";
import { can, requireOrgSession } from "@/server/session";
import { loadBoard } from "@/server/deals";
import { sanitizeSearch } from "@/features/crm/schemas";
import { DEAL_STATUS_LABEL, formatCents, type DealStatus } from "@/features/crm/deals";

export const metadata: Metadata = { title: "Funil de vendas" };

const STATUSES = Object.keys(DEAL_STATUS_LABEL) as DealStatus[];
const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ status?: string; mine?: string; q?: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "deals.read")) redirect("/");
  const sp = await searchParams;
  const status: DealStatus = STATUSES.includes(sp.status as DealStatus) ? (sp.status as DealStatus) : "open";
  const mine = sp.mine === "1";
  const q = sanitizeSearch(sp.q);
  const board = await loadBoard(s, { status, mine, q });
  const canWrite = can(s, "deals.write");
  const href = (o: { status?: DealStatus; mine?: boolean }) => {
    const p = new URLSearchParams();
    const st = o.status ?? status;
    if (st !== "open") p.set("status", st);
    if (o.mine ?? mine) p.set("mine", "1");
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/deals?${qs}` : "/deals";
  };
  const total = board?.deals.reduce((t, d) => t + (d.value_cents ?? 0), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Funil de vendas"
        description="Leads e oportunidades, da primeira conversa ao fechamento."
        actions={canWrite ? <Link href="/deals/new" className={buttonClass("primary")}><Plus aria-hidden className="size-4" />Nova oportunidade</Link> : null}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Situação" className="inline-flex rounded-full border border-border p-0.5">
          {STATUSES.map((st) => (
            <Link key={st} href={href({ status: st })} aria-current={st === status ? "page" : undefined}
              className={cx("rounded-full px-3 py-1 text-sm", st === status ? "bg-ink text-ink-fg" : "text-muted hover:text-fg")}>
              {DEAL_STATUS_LABEL[st]}s
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={href({ mine: !mine })} aria-pressed={mine} className={buttonClass(mine ? "ink" : "secondary", "sm")}>Somente minhas</Link>
          <SearchForm q={q} placeholder="Buscar pelo título" />
        </div>
      </div>
      {board && !board.failed ? (
        <p className="text-sm text-muted tabular">
          {board.deals.length} {board.deals.length === 1 ? "oportunidade" : "oportunidades"}{total ? ` · ${formatCents(total)}` : ""}
        </p>
      ) : null}

      {!board || board.failed ? (
        <EmptyState title="Não foi possível carregar o funil." description="Tente novamente em instantes." />
      ) : status === "open" ? (
        board.deals.length === 0 && !q && !mine ? (
          <EmptyState title="Nenhuma oportunidade aberta." description={canWrite ? "Cadastre o primeiro lead para começar o funil." : undefined}
            action={canWrite ? <Link href="/deals/new" className={buttonClass("primary", "sm")}>Nova oportunidade</Link> : undefined} />
        ) : (
          <DealBoard key={`${mine}-${q}`} stages={board.pipeline.stages} initial={board.deals} canWrite={canWrite} />
        )
      ) : board.deals.length === 0 ? (
        <EmptyState title={`Nenhuma oportunidade ${DEAL_STATUS_LABEL[status].toLowerCase()}.`} />
      ) : (
        <Table>
          <thead><tr><Th>Título</Th><Th>Valor</Th><Th>Contato / empresa</Th><Th>Responsável</Th><Th>Atualizada</Th></tr></thead>
          <tbody>
            {board.deals.map((d) => (
              <tr key={d.id} className="hover:bg-surface-2">
                <Td><Link href={`/deals/${d.id}`} className="underline-offset-2 hover:underline">{d.title}</Link></Td>
                <Td>{d.value_cents !== null ? formatCents(d.value_cents) : "—"}</Td>
                <Td className="text-muted">{[d.contact, d.company].filter(Boolean).join(" · ") || "—"}</Td>
                <Td className="text-muted">{d.owner ?? "—"}</Td>
                <Td className="text-muted">{dateFmt.format(new Date(d.updated_at))}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

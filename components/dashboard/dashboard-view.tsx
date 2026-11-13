import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, User } from "lucide-react";
import { Alert } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { cx } from "@/design-system/components/cx";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/security/permissions";
import type { Dashboard } from "@/server/dashboard";
import { CountUp, DailyBars, Gauge, GrowthChart, HBars } from "@/components/dashboard/charts";

// Painel em bento: grade de 4 colunas a partir de 1024 px de largura do próprio painel (container query), 2 a partir
// de 640 px e 1 abaixo. Só apresentação: os números chegam prontos (consultas reais em server/dashboard.ts) e os
// módulos que ainda não existem aparecem como "Em breve", sem número inventado.

export type DashboardViewProps = {
  d: Dashboard;
  firstName: string;
  orgName: string;
  role: Role;
  mfaOn: boolean;
  canWrite: { contacts: boolean; companies: boolean };
  /** a lista de auditoria (server component), quando o papel pode ver */
  activity?: ReactNode;
};

function Tile({ title, action, className, children }: { title?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cx("flex min-w-0 flex-col rounded-lg border border-border bg-surface p-5", className)}>
      {title || action ? (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-sm text-muted">{title}</h2> : null}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
function ago(iso: string) {
  const min = Math.round((Date.parse(iso) - Date.now()) / 60000);
  if (Math.abs(min) < 60) return rtf.format(min, "minute");
  if (Math.abs(min) < 60 * 24) return rtf.format(Math.round(min / 60), "hour");
  return rtf.format(Math.round(min / 1440), "day");
}

// As áreas com que a Zaniva trabalha; só "Clientes e vendas" já existe no sistema.
const MODULES = [
  { name: "Clientes e vendas", detail: "Contatos e empresas", href: "/contacts" },
  { name: "Atendimento e chamados", detail: "Suporte ao cliente" },
  { name: "Pessoas e RH", detail: "Funcionários e equipe" },
  { name: "Estoque e gestão", detail: "Produtos e operação" },
  { name: "Equipamentos e inventário", detail: "Patrimônio e chamados técnicos" },
  { name: "Assinaturas eletrônicas", detail: "Documentos e contratos" },
];

export function DashboardView({ d, firstName, orgName, role, mfaOn, canWrite, activity }: DashboardViewProps) {
  const month = d.daily.slice(-30);
  const new30 = month.reduce((t, p) => t + p.contacts + p.companies, 0);
  const showAudit = Boolean(activity);
  const team = d.team;

  const steps = [
    { done: true, label: "Organização criada", href: "/settings/organization" },
    { done: mfaOn, label: "Verificação em duas etapas", href: "/settings/security" },
    ...(team ? [{ done: team.total > 1, label: "Equipe convidada", href: "/settings/members" }] : []),
    ...(d.canCompanies ? [{ done: d.totals.companies > 0, label: "Primeira empresa", href: "/companies/new" }] : []),
    ...(d.canContacts ? [{ done: d.totals.contacts > 0, label: "Primeiro contato", href: "/contacts/new" }] : []),
  ];
  const done = steps.filter((st) => st.done).length;
  const next = steps.find((st) => !st.done);

  const q = d.quality;
  const pct = (n: number) => (q.total ? Math.round((n / q.total) * 100) : 0);
  const ownersMax = Math.max(...d.owners.map((o) => o.n), 1);

  return (
    <div className="@container">
      {d.failed ? <div className="mb-3"><Alert tone="danger">Não foi possível carregar os números agora. Recarregue a página.</Alert></div> : null}
      <div className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
        {/* abertura: saudação, base e os cadastros de cada dia */}
        <Tile className="@min-[640px]:col-span-2 @min-[1024px]:col-start-1 @min-[1024px]:row-start-1">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[32px] leading-tight">
                Olá, <span className="text-brand">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted">
                {orgName} · {ROLE_LABEL[role]}
              </p>
            </div>
            {d.canContacts ? (
              <div className="text-right">
                <p className="text-xs text-muted">Contatos</p>
                <p className="text-[36px] leading-none"><CountUp value={d.totals.contacts} /></p>
                <p className="mt-1.5 text-xs text-muted tabular">
                  {d.canCompanies ? `${d.totals.companies.toLocaleString("pt-BR")} empresas · ` : ""}
                  {new30 > 0 ? `+${new30.toLocaleString("pt-BR")} cadastros em 30 dias` : "nenhum cadastro em 30 dias"}
                </p>
              </div>
            ) : null}
          </div>
          {month.length ? <div className="mt-6 flex flex-1"><DailyBars points={month} /></div> : null}
        </Tile>

        {team ? (
          <Tile title="Equipe" className="@min-[1024px]:col-start-3 @min-[1024px]:row-start-1" action={<Link href="/settings/members" className="text-xs text-muted hover:text-fg">Gerenciar</Link>}>
            <p className="text-[36px] leading-none"><CountUp value={team.total} /></p>
            <p className="mt-1.5 text-xs text-muted">{team.total === 1 ? "pessoa na organização" : "pessoas na organização"}</p>
            <ul className="mt-5 flex flex-col gap-2 text-sm">
              {ROLES.filter((r) => team.roles[r] > 0).map((r) => (
                <li key={r} className="flex justify-between gap-3">
                  <span className="text-muted">{ROLE_LABEL[r]}</span>
                  <span className="tabular">{team.roles[r]}</span>
                </li>
              ))}
            </ul>
            {team.invites !== null ? (
              <p className="mt-auto pt-5 text-xs text-muted">
                {team.invites === 0 ? "Nenhum convite pendente" : `${team.invites} convite${team.invites > 1 ? "s" : ""} pendente${team.invites > 1 ? "s" : ""}`}
              </p>
            ) : null}
          </Tile>
        ) : null}

        <Tile title="Configuração" className="@min-[1024px]:col-start-4 @min-[1024px]:row-start-1">
          <div className="flex flex-1 flex-col items-center justify-center">
            <Gauge done={done} total={steps.length} />
            <p className="mt-2 text-2xl tabular">
              {done} <span className="text-sm text-muted">de {steps.length}</span>
            </p>
            <p className="mt-1 text-xs text-muted">passos concluídos</p>
          </div>
          {next ? (
            <Link href={next.href} className={buttonClass("secondary", "sm", "mt-4 self-center")}>
              Próximo: {next.label}
            </Link>
          ) : (
            <p className="mt-4 self-center text-xs text-muted">Tudo pronto</p>
          )}
        </Tile>

        {d.canContacts || d.canCompanies ? (
          <Tile title="Crescimento da base" className="@min-[640px]:col-span-2 @min-[1024px]:col-start-1 @min-[1024px]:row-start-2 @min-[1024px]:row-span-2">
            <GrowthChart daily={d.daily} before={d.before} />
          </Tile>
        ) : null}

        {d.canContacts ? (
          <Tile title="Contatos por responsável" className="@min-[1024px]:col-start-3 @min-[1024px]:row-start-2">
            {d.owners.length ? (
              <HBars items={d.owners.slice(0, 5).map((o) => ({ label: o.isMe ? `${o.label} (você)` : o.label, value: o.n, max: ownersMax }))} />
            ) : (
              <p className="text-sm text-muted">Nenhum contato ainda.</p>
            )}
          </Tile>
        ) : null}

        {/* módulos: as áreas da Zaniva, com o estado real de cada uma */}
        <section className="flex min-w-0 flex-col rounded-lg bg-ink p-5 text-ink-fg @min-[1024px]:col-start-4 @min-[1024px]:row-start-2 @min-[1024px]:row-span-2">
          <header className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm opacity-70">Módulos</h2>
            <span className="text-xs opacity-70 tabular">1 de {MODULES.length} ativo</span>
          </header>
          <ul className="flex flex-col gap-1">
            {MODULES.map((m) => {
              const inner = (
                <>
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug">{m.name}</span>
                    <span className="block truncate text-xs opacity-60">{m.detail}</span>
                  </span>
                  <span className={cx("flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs", m.href ? "border-current" : "border-current opacity-50")}>
                    {m.href ? <i aria-hidden className="size-1.5 rounded-full bg-accent" /> : null}
                    {m.href ? "Ativo" : "Em breve"}
                  </span>
                </>
              );
              return (
                <li key={m.name}>
                  {m.href ? (
                    <Link href={m.href} className="-mx-2 flex items-center justify-between gap-3 rounded-sm px-2 py-2 hover:bg-white/10">{inner}</Link>
                  ) : (
                    <div className="-mx-2 flex items-center justify-between gap-3 px-2 py-2">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-auto pt-5 text-xs opacity-60">Cada módulo entra quando estiver pronto e testado com isolamento entre empresas.</p>
        </section>

        {d.canContacts ? (
          <Tile title="Qualidade do cadastro" className="@min-[1024px]:col-start-3 @min-[1024px]:row-start-3">
            {q.total ? (
              <HBars
                unit="%"
                items={[
                  { label: "Com e-mail", value: pct(q.email), max: 100 },
                  { label: "Com telefone", value: pct(q.phone), max: 100 },
                  { label: "Com empresa", value: pct(q.company), max: 100 },
                  { label: "Com responsável", value: pct(q.owner), max: 100 },
                ]}
              />
            ) : (
              <p className="text-sm text-muted">Cadastre contatos para ver o quanto estão completos.</p>
            )}
          </Tile>
        ) : null}

        {d.canContacts || d.canCompanies ? (
          <Tile
            title="Cadastros recentes"
            className={cx("@min-[640px]:col-span-2 @min-[1024px]:col-start-1 @min-[1024px]:row-start-4", !showAudit && "@min-[1024px]:col-span-4")}
          >
            {d.recent.length ? (
              <ul className="-mx-2 flex flex-col">
                {d.recent.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link href={`/${r.kind === "contact" ? "contacts" : "companies"}/${r.id}`} className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-surface-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-surface-2">
                        {r.kind === "contact" ? <User aria-hidden className="size-4" strokeWidth={1.5} /> : <Building2 aria-hidden className="size-4" strokeWidth={1.5} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{r.name}</span>
                        <span className="block text-xs text-muted">{r.kind === "contact" ? "Contato" : "Empresa"}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">{ago(r.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">Nada cadastrado ainda.</p>
                <div className="flex flex-wrap gap-2">
                  {canWrite.contacts ? <Link href="/contacts/new" className={buttonClass("primary", "sm")}>Novo contato</Link> : null}
                  {canWrite.companies ? <Link href="/companies/new" className={buttonClass("secondary", "sm")}>Nova empresa</Link> : null}
                </div>
              </div>
            )}
          </Tile>
        ) : null}

        {showAudit ? (
          <Tile title="Atividade recente" className="@min-[640px]:col-span-2 @min-[1024px]:col-start-3 @min-[1024px]:row-start-4">
            {activity}
          </Tile>
        ) : null}
      </div>

      <ul className="sr-only">
        {steps.map((st) => (
          <li key={st.label}>
            {st.label}: {st.done ? "concluído" : "pendente"}
          </li>
        ))}
      </ul>
    </div>
  );
}


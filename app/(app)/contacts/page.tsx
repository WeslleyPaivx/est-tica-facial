import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/design-system/components/layout";
import { EmptyState } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { Table, Td, Th } from "@/design-system/components/table";
import { Pagination, SearchForm } from "@/components/crm/list-controls";
import { can, requireOrgSession } from "@/server/session";
import { nameMaps } from "@/server/crm";
import { PAGE_SIZE, parsePage, sanitizeSearch } from "@/features/crm/schemas";

export const metadata: Metadata = { title: "Contatos" };

type Row = { id: string; full_name: string; email: string | null; phone: string | null; company_id: string | null; owner_id: string | null };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "contacts.read")) redirect("/");
  const sp = await searchParams;
  const q = sanitizeSearch(sp.q);
  const page = parsePage(sp.page);

  let query = s.supabase
    .from("contacts")
    .select("id, full_name, email, phone, company_id, owner_id", { count: "exact" })
    .eq("organization_id", s.active.organization_id)
    .order("full_name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count, error } = await query;
  const rows = (data ?? []) as Row[];
  const names = await nameMaps(
    s,
    [...new Set(rows.map((r) => r.company_id).filter((v): v is string => Boolean(v)))],
    [...new Set(rows.map((r) => r.owner_id).filter((v): v is string => Boolean(v)))],
  );
  const canWrite = can(s, "contacts.write");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contatos"
        description="Pessoas com quem sua organização se relaciona."
        actions={canWrite ? <Link href="/contacts/new" className={buttonClass("primary")}><Plus aria-hidden className="size-4" />Novo contato</Link> : null}
      />
      <SearchForm q={q} placeholder="Buscar por nome, e-mail ou telefone" />
      {error ? (
        <EmptyState title="Não foi possível carregar os contatos." description="Tente novamente em instantes." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={q ? "Nenhum contato encontrado." : "Nenhum contato cadastrado."}
          description={q ? "Tente outro termo de busca." : canWrite ? "Cadastre o primeiro contato da organização." : undefined}
        />
      ) : (
        <>
          <Table>
            <thead><tr><Th>Nome</Th><Th>Empresa</Th><Th>E-mail</Th><Th>Telefone</Th><Th>Responsável</Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2">
                  <Td><Link href={`/contacts/${r.id}`} className="underline-offset-2 hover:underline">{r.full_name}</Link></Td>
                  <Td className="text-muted">{(r.company_id && names.company.get(r.company_id)) || "—"}</Td>
                  <Td className="text-muted">{r.email ?? "—"}</Td>
                  <Td className="text-muted">{r.phone ?? "—"}</Td>
                  <Td className="text-muted">{(r.owner_id && names.owner.get(r.owner_id)) || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination basePath="/contacts" q={q} page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}

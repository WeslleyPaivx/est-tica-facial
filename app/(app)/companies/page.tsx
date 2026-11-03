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
import { PAGE_SIZE, parsePage, sanitizeSearch } from "@/features/crm/schemas";

export const metadata: Metadata = { title: "Empresas" };

type Row = { id: string; name: string; email: string | null; phone: string | null; website: string | null };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "companies.read")) redirect("/");
  const sp = await searchParams;
  const q = sanitizeSearch(sp.q);
  const page = parsePage(sp.page);

  let query = s.supabase
    .from("companies")
    .select("id, name, email, phone, website", { count: "exact" })
    .eq("organization_id", s.active.organization_id)
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, count, error } = await query;
  const rows = (data ?? []) as Row[];
  const canWrite = can(s, "companies.write");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Empresas"
        description="Empresas clientes e parceiras desta organização."
        actions={canWrite ? <Link href="/companies/new" className={buttonClass("primary")}><Plus aria-hidden className="size-4" />Nova empresa</Link> : null}
      />
      <SearchForm q={q} placeholder="Buscar por nome ou e-mail" />
      {error ? (
        <EmptyState title="Não foi possível carregar as empresas." description="Tente novamente em instantes." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={q ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada."}
          description={q ? "Tente outro termo de busca." : canWrite ? "Cadastre a primeira empresa para vinculá-la a contatos." : undefined}
        />
      ) : (
        <>
          <Table>
            <thead><tr><Th>Nome</Th><Th>E-mail</Th><Th>Telefone</Th><Th>Site</Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2">
                  <Td><Link href={`/companies/${r.id}`} className="underline-offset-2 hover:underline">{r.name}</Link></Td>
                  <Td className="text-muted">{r.email ?? "—"}</Td>
                  <Td className="text-muted">{r.phone ?? "—"}</Td>
                  <Td className="text-muted">{r.website ? r.website.replace(/^https?:\/\//, "") : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination basePath="/companies" q={q} page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}

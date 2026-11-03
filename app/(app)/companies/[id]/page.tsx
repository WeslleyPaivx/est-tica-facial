import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/design-system/components/layout";
import { CompanyForm, DeleteRecord, type CompanyValues } from "@/components/crm/crm-forms";
import { can, requireOrgSession } from "@/server/session";
import { idSchema } from "@/features/organizations/schemas";

export const metadata: Metadata = { title: "Empresa" };

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireOrgSession();
  const id = idSchema.safeParse((await params).id);
  if (!id.success || !can(s, "companies.read")) notFound();
  // RLS + filtro por organização ativa: UUID de outro tenant resulta em 404.
  const { data } = await s.supabase
    .from("companies")
    .select("id, name, email, phone, website, notes")
    .eq("id", id.data)
    .eq("organization_id", s.active.organization_id)
    .maybeSingle();
  if (!data) notFound();
  const company = data as CompanyValues & { id: string };
  const { count } = await s.supabase.from("contacts").select("id", { count: "exact", head: true }).eq("company_id", company.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={company.name} description={`${count ?? 0} contato(s) vinculado(s).`} />
      <CompanyForm values={company} readOnly={!can(s, "companies.write")} />
      {can(s, "companies.delete") ? (
        <Section title="Excluir empresa" description="Os contatos vinculados são mantidos, sem empresa.">
          <DeleteRecord entity="companies" id={company.id} label={company.name} />
        </Section>
      ) : null}
    </div>
  );
}

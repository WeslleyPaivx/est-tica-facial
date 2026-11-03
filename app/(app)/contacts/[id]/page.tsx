import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/design-system/components/layout";
import { ContactForm, DeleteRecord, type ContactValues } from "@/components/crm/crm-forms";
import { can, requireOrgSession } from "@/server/session";
import { contactFormOptions } from "@/server/crm";
import { idSchema } from "@/features/organizations/schemas";

export const metadata: Metadata = { title: "Contato" };

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireOrgSession();
  const id = idSchema.safeParse((await params).id);
  if (!id.success || !can(s, "contacts.read")) notFound();
  // RLS + filtro por organização ativa: UUID de outro tenant resulta em 404.
  const [{ data }, options] = await Promise.all([
    s.supabase
      .from("contacts")
      .select("id, full_name, email, phone, company_id, owner_id, notes")
      .eq("id", id.data)
      .eq("organization_id", s.active.organization_id)
      .maybeSingle(),
    contactFormOptions(s),
  ]);
  if (!data) notFound();
  const contact = data as ContactValues & { id: string };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={contact.full_name} />
      <ContactForm values={contact} {...options} readOnly={!can(s, "contacts.write")} />
      {can(s, "contacts.delete") ? (
        <Section title="Excluir contato">
          <DeleteRecord entity="contacts" id={contact.id} label={contact.full_name} />
        </Section>
      ) : null}
    </div>
  );
}

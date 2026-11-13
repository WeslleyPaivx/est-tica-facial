import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/design-system/components/layout";
import { ContactForm } from "@/components/crm/crm-forms";
import { can, requireOrgSession } from "@/server/session";
import { contactFormOptions } from "@/server/crm";

export const metadata: Metadata = { title: "Novo contato" };

export default async function NewContactPage() {
  const s = await requireOrgSession();
  if (!can(s, "contacts.write")) redirect("/contacts");
  const options = await contactFormOptions(s);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Novo contato" />
      <ContactForm
        values={{ request_id: randomUUID(), full_name: "", email: null, phone: null, company_id: null, owner_id: s.user.id, notes: null }}
        {...options}
        readOnly={false}
      />
    </div>
  );
}

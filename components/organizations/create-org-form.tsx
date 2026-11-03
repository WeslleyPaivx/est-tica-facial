"use client";

import { useActionState, useState } from "react";
import { Button } from "@/design-system/components/button";
import { Field, Input } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import { createOrganizationAction } from "@/server/actions/organizations";
import { slugify } from "@/features/organizations/schemas";

export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrganizationAction, {});
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="Nome da organização" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </Field>
      <Field label="Identificador" htmlFor="slug" hint="Letras minúsculas, números e hífens. Único na plataforma.">
        <Input
          id="slug"
          name="slug"
          required
          maxLength={48}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase());
          }}
          className="font-mono"
        />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar organização"}</Button>
    </form>
  );
}

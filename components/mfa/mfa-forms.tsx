"use client";

import { useActionState } from "react";
import { Button } from "@/design-system/components/button";
import { Field, Input } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import { enrollTotpAction, verifyTotpAction, type EnrollState } from "@/server/actions/mfa";

function CodeForm({ factorId, label }: { factorId: string; label: string }) {
  const [state, action, pending] = useActionState(verifyTotpAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="factorId" value={factorId} />
      <Field label="Código do autenticador" htmlFor="code">
        <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required className="tabular tracking-[0.3em]" />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Verificando…" : label}</Button>
    </form>
  );
}

export function VerifyFactor({ factorId }: { factorId: string }) {
  return <CodeForm factorId={factorId} label="Verificar" />;
}

export function EnrollFactor() {
  const [state, enroll, pending] = useActionState<EnrollState>(enrollTotpAction, {});
  if (!state.factorId) {
    return (
      <form action={enroll} className="flex flex-col gap-4">
        <FormStatus state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Preparando…" : "Configurar autenticador"}</Button>
      </form>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted">Escaneie o QR code no seu aplicativo autenticador (TOTP) e informe o código gerado.</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URI SVG gerado pelo Supabase Auth */}
      <img src={state.qrCode} alt="QR code para configurar o autenticador" width={176} height={176} className="rounded-md border border-border bg-white p-2" />
      <details className="text-[13px]">
        <summary className="cursor-pointer text-muted">Não consegue escanear? Use a chave</summary>
        <code className="mt-2 block break-all rounded-sm bg-surface-2 px-2 py-1 font-mono text-xs">{state.secret}</code>
      </details>
      <CodeForm factorId={state.factorId} label="Ativar MFA" />
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Botão de envio para formulários sem useActionState: trava enquanto o envio está em andamento (sem duplo clique).
export function SubmitButton({ className, children, pendingLabel }: { className?: string; children: ReactNode; pendingLabel?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

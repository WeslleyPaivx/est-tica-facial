import type { ReactNode } from "react";
import { cx } from "./cx";

// Hierarquia só por tamanho (peso único); separação por espaço, sem divisores decorativos.
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div>
        <h1 className="text-[28px] leading-tight md:text-[32px]">{title}</h1>
        {description ? <p className="mt-1.5 text-[15px] text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Section({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-lg border border-border bg-surface p-6", className)}>
      <header className="mb-5">
        <h2 className="text-xl leading-snug">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

const ACCENT_BAR = { forest: "bg-forest", pink: "bg-pink", accent: "bg-accent", butter: "bg-butter" } as const;

// Card de métrica: barra de 4px à esquerda é o único uso de cor. Só para números reais.
export function StatCard({ value, label, accent }: { value: ReactNode; label: string; accent: keyof typeof ACCENT_BAR }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface py-5 pr-5 pl-7">
      <span aria-hidden className={cx("absolute inset-y-0 left-0 w-1", ACCENT_BAR[accent])} />
      <p className="text-4xl leading-none tabular">{value}</p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

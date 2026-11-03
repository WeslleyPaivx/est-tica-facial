import type { ReactNode } from "react";
import { cx } from "./cx";

type Tone = "neutral" | "success" | "danger" | "warning";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg border-border",
  success: "bg-success-bg text-success border-transparent",
  danger: "bg-danger-bg text-danger border-transparent",
  warning: "bg-warning-bg text-warning border-transparent",
};

export function Alert({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("rounded-md border px-3 py-2 text-[13px]", tones[tone])}>
      {children}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex h-5 items-center rounded-sm border px-1.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function FormStatus({ state }: { state: { error?: string; message?: string } }) {
  if (state.error) return <Alert tone="danger">{state.error}</Alert>;
  if (state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border px-5 py-8">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-prose text-[13px] text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";

type Variant = "primary" | "ink" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-full whitespace-nowrap transition-colors duration-100 disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-95",
  ink: "bg-ink text-ink-fg hover:opacity-90",
  secondary: "bg-surface text-fg border border-border-strong hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-surface text-danger border border-border-strong hover:bg-danger-bg",
};
const sizes: Record<Size, string> = { sm: "h-8 px-3.5 text-[13px]", md: "h-10 px-5 text-sm" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

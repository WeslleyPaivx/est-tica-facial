import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/design-system/components/field";
import { buttonClass } from "@/design-system/components/button";
import { cx } from "@/design-system/components/cx";

// Busca por GET: funciona sem JavaScript e mantém a URL compartilhável.
export function SearchForm({ q, placeholder }: { q: string; placeholder: string }) {
  return (
    <form role="search" className="relative w-full max-w-sm">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <label htmlFor="q" className="sr-only">{placeholder}</label>
      <Input id="q" name="q" type="search" defaultValue={q} placeholder={placeholder} className="pl-9" maxLength={80} />
    </form>
  );
}

export function Pagination({ basePath, q, page, total, pageSize }: { basePath: string; q: string; page: number; total: number; pageSize: number }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => `${basePath}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const nav = (p: number, label: string, Icon: typeof ChevronLeft, disabled: boolean) =>
    disabled ? (
      <span aria-disabled className={cx(buttonClass("secondary", "sm"), "pointer-events-none opacity-40")}><Icon aria-hidden className="size-4" />{label}</span>
    ) : (
      <Link href={href(p)} className={buttonClass("secondary", "sm")}><Icon aria-hidden className="size-4" />{label}</Link>
    );
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3 text-sm text-muted">
      <span className="tabular">{from}–{to} de {total}</span>
      <div className="flex gap-2">
        {nav(page - 1, "Anterior", ChevronLeft, page <= 1)}
        {nav(page + 1, "Próxima", ChevronRight, page >= pages)}
      </div>
    </nav>
  );
}

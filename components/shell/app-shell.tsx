"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Briefcase, Building2, Contact, History, House, PanelLeft, ShieldCheck, Users, X } from "lucide-react";
import { cx } from "@/design-system/components/cx";
import { Logo } from "@/design-system/components/logo";
import { NAV, type NavItem } from "./nav";

const ICONS = { home: House, contact: Contact, briefcase: Briefcase, building: Building2, users: Users, history: History, shield: ShieldCheck };
const COLLAPSE_COOKIE = "zaniva_sidebar";

function NavLinks({ permissions, collapsed, onNavigate }: { permissions: string[]; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const visible = (i: NavItem) => !i.permission || permissions.includes(i.permission);
  return (
    <nav aria-label="Principal" className="flex flex-col gap-6 px-3 py-5">
      {NAV.map((g) => (
        <div key={g.group} className="flex flex-col gap-0.5">
          {!collapsed ? <p className="px-3 pb-1.5 text-xs text-muted">{g.group}</p> : null}
          {g.items.filter(visible).map((item) => {
            const Icon = ICONS[item.icon];
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cx(
                  "flex h-9 items-center gap-2.5 rounded-full px-3 text-sm transition-colors duration-100",
                  active ? "bg-accent-wash text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                  collapsed && "justify-center",
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  header,
  permissions,
  initialCollapsed,
  children,
}: {
  header: ReactNode;
  permissions: string[];
  initialCollapsed: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${COLLAPSE_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div className="flex min-h-dvh">
      <aside
        className={cx(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-bg md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cx("flex h-16 items-center px-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed ? <Logo /> : null}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-expanded={!collapsed}
            className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
          >
            <PanelLeft aria-hidden className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <NavLinks permissions={permissions} collapsed={collapsed} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-bg">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                <X aria-hidden className="size-4" />
              </button>
            </div>
            <NavLinks permissions={permissions} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="z-glass sticky top-0 z-30 flex h-16 items-center gap-2 border-x-0 border-t-0 px-4 md:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 md:hidden"
          >
            <PanelLeft aria-hidden className="size-4" strokeWidth={1.75} />
          </button>
          {header}
        </div>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-8 md:py-12">{children}</main>
      </div>
    </div>
  );
}

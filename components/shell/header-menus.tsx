"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { cx } from "@/design-system/components/cx";
import { switchOrganizationAction } from "@/server/actions/organizations";
import { signOutAction } from "@/server/actions/auth";

type OrgOption = { id: string; name: string; roleLabel: string };

const menuContent = "z-glass z-glass-refract z-50 min-w-56 rounded-lg p-1 text-[13px] text-fg";
const menuItem =
  "flex h-8 w-full cursor-default select-none items-center gap-2 rounded-md px-2 outline-none data-[highlighted]:bg-surface-2";

export function OrgSwitcher({ current, options }: { current: OrgOption; options: OrgOption[] }) {
  return (
    <Menu.Root>
      <Menu.Trigger className="flex h-8 max-w-[60vw] items-center gap-2 rounded-md px-2 text-[13px] hover:bg-surface-2">
        <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-sm bg-accent text-[11px] font-semibold text-accent-fg">
          {current.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="truncate font-medium">{current.name}</span>
        <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="start" sideOffset={6} className={menuContent}>
          <Menu.Label className="px-2 py-1 text-xs text-muted">Organizações</Menu.Label>
          {options.map((o) => (
            <form key={o.id} action={switchOrganizationAction}>
              <input type="hidden" name="organizationId" value={o.id} />
              <Menu.Item asChild>
                <button type="submit" className={menuItem}>
                  <span className="min-w-0 flex-1 truncate text-left">{o.name}</span>
                  <span className="text-xs text-muted">{o.roleLabel}</span>
                  <Check aria-hidden className={cx("size-3.5", o.id === current.id ? "opacity-100" : "opacity-0")} />
                </button>
              </Menu.Item>
            </form>
          ))}
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item asChild>
            <a href="/onboarding" className={menuItem}>Criar ou entrar em organização</a>
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

type Theme = "light" | "dark" | "system";

export function UserMenu({ email, name, theme }: { email: string; name: string; theme: Theme }) {
  const [current, setCurrent] = useState<Theme>(theme);
  const applyTheme = (t: Theme) => {
    setCurrent(t);
    document.documentElement.dataset.theme = t;
    document.cookie = `zaniva_theme=${t}; path=/; max-age=31536000; samesite=lax`;
  };
  const initials = (name || email).slice(0, 2).toUpperCase();
  const themes: Array<[Theme, string, typeof Sun]> = [
    ["light", "Claro", Sun],
    ["dark", "Escuro", Moon],
    ["system", "Sistema", Monitor],
  ];
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Menu da conta" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-[11px] font-semibold hover:bg-surface-2">
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={6} className={menuContent}>
          <div className="px-2 py-1.5">
            {name ? <p className="truncate font-medium">{name}</p> : null}
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Label className="px-2 py-1 text-xs text-muted">Tema</Menu.Label>
          <Menu.RadioGroup value={current} onValueChange={(v) => applyTheme(v as Theme)}>
            {themes.map(([value, label, Icon]) => (
              <Menu.RadioItem key={value} value={value} className={menuItem}>
                <Icon aria-hidden className="size-3.5 text-muted" />
                <span className="flex-1">{label}</span>
                <Menu.ItemIndicator>
                  <Check aria-hidden className="size-3.5" />
                </Menu.ItemIndicator>
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
          <Menu.Separator className="my-1 h-px bg-border" />
          <form action={signOutAction}>
            <Menu.Item asChild>
              <button type="submit" className={menuItem}>
                <LogOut aria-hidden className="size-3.5 text-muted" />
                Sair
              </button>
            </Menu.Item>
          </form>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

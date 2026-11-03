export type NavItem = { href: string; label: string; icon: "home" | "building" | "users" | "history" | "shield"; permission?: string };

// Somente rotas implementadas. Módulos da Fase 2+ entram aqui quando existirem de fato.
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Geral", items: [{ href: "/", label: "Visão geral", icon: "home" }] },
  {
    group: "Configurações",
    items: [
      { href: "/settings/organization", label: "Organização", icon: "building" },
      { href: "/settings/members", label: "Membros", icon: "users", permission: "members.read" },
      { href: "/settings/audit", label: "Auditoria", icon: "history", permission: "audit.read" },
      { href: "/settings/security", label: "Segurança", icon: "shield" },
    ],
  },
];

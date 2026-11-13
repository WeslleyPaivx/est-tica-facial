export type NavItem = { href: string; label: string; icon: "home" | "kanban" | "tasks" | "contact" | "briefcase" | "building" | "users" | "history" | "shield"; permission?: string };

// Somente rotas implementadas. Módulos da Fase 2+ entram aqui quando existirem de fato.
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Geral", items: [{ href: "/", label: "Visão geral", icon: "home" }] },
  {
    group: "CRM",
    items: [
      { href: "/deals", label: "Funil", icon: "kanban", permission: "deals.read" },
      { href: "/tasks", label: "Tarefas", icon: "tasks", permission: "tasks.read" },
      { href: "/contacts", label: "Contatos", icon: "contact", permission: "contacts.read" },
      { href: "/companies", label: "Empresas", icon: "briefcase", permission: "companies.read" },
    ],
  },
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

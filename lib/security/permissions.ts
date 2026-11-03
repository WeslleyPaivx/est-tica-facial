export const ROLES = ["owner", "admin", "member", "limited"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
  limited: "Acesso limitado",
};

const RANK: Record<Role, number> = { owner: 4, admin: 3, member: 2, limited: 1 };

export const MFA_REQUIRED_ROLES: readonly Role[] = ["owner", "admin"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// Espelha a regra do banco (private.update_member_role/invite_member) só para a UI;
// a decisão real é sempre do banco.
export function assignableRoles(caller: Role, { forInvite }: { forInvite: boolean }): Role[] {
  return ROLES.filter((r) => {
    if (forInvite && r === "owner") return false;
    return caller === "owner" || RANK[r] < RANK[caller];
  });
}

export function canManageMember(caller: Role, target: Role): boolean {
  return caller === "owner" || RANK[target] < RANK[caller];
}

export function requiresMfa(role: Role): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}

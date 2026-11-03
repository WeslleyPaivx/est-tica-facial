import type { Role } from "@/lib/security/permissions";

export type Organization = { id: string; name: string; slug: string; status: "active" | "suspended" };

export type Membership = {
  id: string;
  organization_id: string;
  role: Role;
  organization: Organization;
};

export type ActionState = { ok?: boolean; error?: string; message?: string };

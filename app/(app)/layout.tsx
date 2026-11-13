import { cookies } from "next/headers";
import { AppShell } from "@/components/shell/app-shell";
import { OrgSwitcher, UserMenu } from "@/components/shell/header-menus";
import { Alert } from "@/design-system/components/feedback";
import { requireOrgSession } from "@/server/session";
import { myDueTaskCount } from "@/server/tasks";
import { ROLE_LABEL } from "@/lib/security/permissions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireOrgSession();
  const [cookieStore, dueTasks] = await Promise.all([cookies(), myDueTaskCount(s)]);
  const themeCookie = cookieStore.get("zaniva_theme")?.value;
  const theme = themeCookie === "light" || themeCookie === "dark" ? themeCookie : "system";
  const toOption = (m: (typeof s.memberships)[number]) => ({
    id: m.organization_id,
    name: m.organization.name,
    roleLabel: ROLE_LABEL[m.role],
  });

  return (
    <AppShell
      permissions={s.permissions}
      badges={{ "/tasks": dueTasks }}
      initialCollapsed={cookieStore.get("zaniva_sidebar")?.value === "1"}
      header={
        <>
          <OrgSwitcher current={toOption(s.active)} options={s.memberships.map(toOption)} />
          <div className="flex-1" />
          <UserMenu email={s.user.email} name={s.user.fullName} theme={theme} />
        </>
      }
    >
      {s.active.organization.status !== "active" ? (
        <div className="mb-4">
          <Alert tone="warning">Esta organização está suspensa. Os dados ficam indisponíveis até a reativação.</Alert>
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}

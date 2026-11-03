import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/design-system/components/feedback";
import { Table, Td, Th } from "@/design-system/components/table";

const ACTION_LABEL: Record<string, string> = {
  "organization.created": "Organização criada",
  "invitation.created": "Convite criado",
  "invitation.revoked": "Convite revogado",
  "invitation.accepted": "Convite aceito",
  "member.role_changed": "Papel alterado",
  "member.removed": "Membro removido",
  "member.left": "Membro saiu",
};

type Row = { id: number; action: string; actor_id: string | null; created_at: string };

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export async function AuditList({ organizationId, limit, compact = false }: { organizationId: string; limit: number; compact?: boolean }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, actor_id, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return <EmptyState title="Não foi possível carregar a auditoria." />;
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return <EmptyState title="Nenhum evento registrado." />;

  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter((v): v is string => Boolean(v)))];
  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const names = new Map((profiles ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));

  if (compact) {
    return (
      <ul className="flex flex-col divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="truncate">
              {ACTION_LABEL[r.action] ?? r.action}
              <span className="text-muted"> · {(r.actor_id && names.get(r.actor_id)) || "Usuário"}</span>
            </span>
            <time className="shrink-0 text-xs text-muted tabular" dateTime={r.created_at}>{fmt.format(new Date(r.created_at))}</time>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <Table>
      <thead>
        <tr><Th>Evento</Th><Th>Autor</Th><Th className="text-right">Data</Th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{ACTION_LABEL[r.action] ?? r.action}</Td>
            <Td className="text-muted">{(r.actor_id && names.get(r.actor_id)) || "Usuário removido"}</Td>
            <Td className="text-right text-muted"><time dateTime={r.created_at}>{fmt.format(new Date(r.created_at))}</time></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

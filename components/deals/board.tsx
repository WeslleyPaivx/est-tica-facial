"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CalendarClock, User } from "lucide-react";
import { cx } from "@/design-system/components/cx";
import { formatCents } from "@/features/crm/deals";
import { moveDealAction } from "@/server/actions/deals";
import type { DealCard, Stage } from "@/server/deals";

// Quadro Kanban: arrastar com mouse ou toque (dnd-kit) e, pelo teclado, o seletor "Mover para" de cada cartão.
// A mudança aparece na hora (otimista) e é desfeita se o servidor recusar.

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
const today = () => new Date().toISOString().slice(0, 10);

export function DealBoard({ stages, initial, canWrite }: { stages: Stage[]; initial: DealCard[]; canWrite: boolean }) {
  const [deals, setDeals] = useState(initial);
  const [dragging, setDragging] = useState<DealCard | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [, startTransition] = useTransition();
  // id estável: sem ele o dnd-kit gera ids diferentes no servidor e no navegador (aviso de hidratação)
  const dndId = useId();
  // toque: segurar ~200 ms para arrastar, assim rolar a tela com o dedo continua funcionando
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  function move(dealId: string, stageId: string) {
    const before = deals.find((d) => d.id === dealId);
    if (!before || before.stage_id === stageId) return;
    setDeals((ds) => ds.map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d)));
    setNotice(null);
    startTransition(async () => {
      const res = await moveDealAction(dealId, stageId);
      if (res.error) {
        setDeals((ds) => ds.map((d) => (d.id === dealId ? { ...d, stage_id: before.stage_id } : d)));
        setNotice({ tone: "error", text: `${res.error} A oportunidade voltou para a etapa anterior.` });
      } else {
        const stage = stages.find((s) => s.id === stageId)?.name ?? "";
        setNotice({ tone: "ok", text: `"${before.title}" movida para ${stage}.` });
      }
    });
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(null);
    if (e.over) move(String(e.active.id), String(e.over.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <p role={notice?.tone === "error" ? "alert" : "status"} className={cx("min-h-5 text-sm", notice?.tone === "error" ? "text-danger" : "text-muted")}>
        {notice?.text}
      </p>
      <DndContext
        id={dndId}
        sensors={sensors}
        onDragStart={(e) => setDragging(deals.find((d) => d.id === e.active.id) ?? null)}
        onDragCancel={() => setDragging(null)}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Arrastando ${deals.find((d) => d.id === active.id)?.title ?? "oportunidade"}.`,
            onDragOver: ({ over }) => (over ? `Sobre a etapa ${stages.find((s) => s.id === over.id)?.name ?? ""}.` : "Fora das etapas."),
            onDragEnd: ({ over }) => (over ? `Solta em ${stages.find((s) => s.id === over.id)?.name ?? ""}.` : "Cancelado."),
            onDragCancel: () => "Movimento cancelado.",
          },
        }}
      >
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {stages.map((stage) => (
            <Column key={stage.id} stage={stage} deals={deals.filter((d) => d.stage_id === stage.id)} stages={stages} canWrite={canWrite} onMove={move} />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>{dragging ? <CardBody deal={dragging} lifted /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ stage, deals, stages, canWrite, onMove }: { stage: Stage; deals: DealCard[]; stages: Stage[]; canWrite: boolean; onMove: (id: string, stageId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, disabled: !canWrite });
  const total = deals.reduce((t, d) => t + (d.value_cents ?? 0), 0);
  return (
    <section
      ref={setNodeRef}
      aria-label={`Etapa ${stage.name}`}
      className={cx(
        "flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col rounded-lg border bg-surface-2 p-2 md:w-auto md:max-w-none md:min-w-[240px] md:flex-1 md:shrink",
        isOver ? "border-brand" : "border-border",
      )}
    >
      <header className="flex items-baseline justify-between gap-2 px-2 pt-1 pb-3">
        <h2 className="truncate text-sm">{stage.name}</h2>
        <span className="shrink-0 text-xs text-muted tabular">
          {deals.length}
          {total ? ` · ${formatCents(total)}` : ""}
        </span>
      </header>
      <ul className="flex min-h-24 flex-col gap-2">
        {deals.map((d) => (
          <li key={d.id}>
            <DraggableCard deal={d} stages={stages} canWrite={canWrite} onMove={onMove} />
          </li>
        ))}
        {deals.length === 0 ? <li className="rounded-sm border border-dashed border-border-strong px-3 py-6 text-center text-xs text-muted">Nada nesta etapa</li> : null}
      </ul>
    </section>
  );
}

function DraggableCard({ deal, stages, canWrite, onMove }: { deal: DealCard; stages: Stage[]; canWrite: boolean; onMove: (id: string, stageId: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id, disabled: !canWrite });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} tabIndex={-1} className={cx("touch-manipulation", isDragging && "opacity-40")}>
      <CardBody deal={deal}>
        {canWrite ? (
          <label className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span className="sr-only">Mover {deal.title} para</span>
            <span aria-hidden>Mover para</span>
            <select
              value={deal.stage_id}
              onChange={(e) => onMove(deal.id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-7 min-w-0 flex-1 rounded-sm border border-border bg-surface px-1.5 text-xs text-fg"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        ) : null}
      </CardBody>
    </div>
  );
}

function CardBody({ deal, lifted = false, children }: { deal: DealCard; lifted?: boolean; children?: React.ReactNode }) {
  const overdue = deal.next_action_at !== null && deal.next_action_at < today();
  return (
    <article className={cx("rounded-sm border border-border bg-surface p-3", lifted && "border-brand")}>
      <Link href={`/deals/${deal.id}`} className="block text-sm leading-snug hover:underline" onPointerDown={(e) => e.stopPropagation()} draggable={false}>
        {deal.title}
      </Link>
      {deal.value_cents !== null ? <p className="mt-1 text-sm tabular">{formatCents(deal.value_cents)}</p> : null}
      {deal.contact || deal.company ? <p className="mt-1 truncate text-xs text-muted">{[deal.contact, deal.company].filter(Boolean).join(" · ")}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {deal.owner ? <span className="flex items-center gap-1"><User aria-hidden className="size-3" strokeWidth={1.5} />{deal.owner}</span> : null}
        {deal.next_action_at ? (
          <span className={cx("flex items-center gap-1", overdue && "text-danger")}>
            <CalendarClock aria-hidden className="size-3" strokeWidth={1.5} />
            {overdue ? "Atrasada · " : ""}
            {dateFmt.format(new Date(`${deal.next_action_at}T12:00:00Z`))}
          </span>
        ) : null}
      </div>
      {children}
    </article>
  );
}

"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { cx } from "@/design-system/components/cx";
import type { DailyPoint } from "@/server/dashboard";

// Peças vivas do painel inicial: SVG e DOM, sem biblioteca. Uma série por gráfico (rosa da marca (brand), que passa
// no contraste nos dois temas); texto sempre nas cores de texto. Com "reduzir movimento", tudo aparece pronto.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const nf = new Intl.NumberFormat("pt-BR");
// as datas chegam como AAAA-MM-DD (dia de São Paulo); meio-dia UTC evita virar o dia em qualquer fuso
const asDate = (day: string) => new Date(`${day}T12:00:00Z`);
const dayFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
const plural = (n: number, one: string, many: string) => `${nf.format(n)} ${n === 1 ? one : many}`;

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

function useMounted() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 700);
      setV(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return <span className={cx("tabular", className)}>{nf.format(reduced ? value : v)}</span>;
}

function Pills<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className="rounded-full px-2.5 py-1 text-xs text-muted transition-colors duration-100 hover:text-fg aria-checked:bg-ink aria-checked:text-ink-fg"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* Cadastros por dia nos últimos 30 dias: uma barra por dia, a altura pelo total do dia. */
export function DailyBars({ points }: { points: DailyPoint[] }) {
  const mounted = useMounted();
  const [hover, setHover] = useState<number | null>(null);
  const totals = points.map((p) => p.contacts + p.companies);
  const max = Math.max(...totals, 1);
  const label = (p: DailyPoint) => {
    return `${dayFmt.format(asDate(p.day))}: ${plural(p.contacts, "contato", "contatos")} e ${plural(p.companies, "empresa", "empresas")}`;
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex min-h-24 flex-1 items-end gap-[3px]" onPointerLeave={() => setHover(null)}>
        {points.map((p, i) => { const t = totals[i] ?? 0; return (
          <button
            key={p.day}
            type="button"
            aria-label={label(p)}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="group relative flex h-full flex-1 items-end"
          >
            <span
              className={cx("block w-full rounded-t-[4px]", t > 0 ? "bg-brand" : "bg-border-strong")}
              style={{
                height: mounted ? (t > 0 ? `${12 + (t / max) * 88}%` : "4px") : "4px",
                opacity: hover === null || hover === i ? 1 : 0.35,
                transition: `height 500ms ${EASE} ${i * 12}ms, opacity 150ms ease`,
              }}
            />
          </button>
        ); })}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-xs text-muted tabular">
        <span>{points[0] ? dayFmt.format(asDate(points[0].day)) : ""}</span>
        <span className="truncate text-fg" aria-live="polite">{hover !== null && points[hover] ? label(points[hover]) : "Novos cadastros por dia"}</span>
        <span>Hoje</span>
      </div>
    </div>
  );
}

/* Base acumulada: contatos ou empresas ao longo do tempo, com período e cursor. */
const RANGES = ["7D", "30D", "12M"] as const;
const SERIES = ["Contatos", "Empresas"] as const;

export function GrowthChart({ daily, before }: { daily: DailyPoint[]; before: { contacts: number; companies: number } }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const [range, setRange] = useState<(typeof RANGES)[number]>("30D");
  const [series, setSeries] = useState<(typeof SERIES)[number]>("Contatos");
  const [hover, setHover] = useState<number | null>(null);

  const key = series === "Contatos" ? "contacts" : "companies";
  const cumulative: { day: string; v: number }[] = [];
  for (const d of daily) cumulative.push({ day: d.day, v: (cumulative.at(-1)?.v ?? before[key]) + d[key] });
  const take = { "7D": 7, "30D": 30, "12M": cumulative.length }[range];
  const step = range === "12M" ? 7 : 1;
  const pts = cumulative.slice(-take).filter((_, i, arr) => i % step === 0 || i === arr.length - 1);

  if (pts.length < 2) return <p className="text-sm text-muted">Sem dados para o período.</p>;

  const W = 640;
  const H = 220;
  const lo = Math.min(...pts.map((p) => p.v));
  const hi = Math.max(...pts.map((p) => p.v));
  const flat = hi === lo;
  const y = (v: number) => (flat ? H - 24 : H - 16 - ((v - lo) / (hi - lo)) * (H - 40));
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * W, y(p.v)] as const);
  const line = xy.map(([x, yy], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  const idx = Math.min(hover ?? pts.length - 1, pts.length - 1);
  const cur = pts[idx]!; // idx sempre dentro de pts (limitado acima)
  const curXY = xy[idx]!;
  const first = pts[0]!.v;
  const last = pts.at(-1)!.v;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => pts[Math.round(f * (pts.length - 1))]!.day);
  const tickFmt = range === "12M" ? monthFmt : dayFmt;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(pts.length - 1, Math.round(((e.clientX - r.left) / r.width) * (pts.length - 1)))));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{dayFmt.format(asDate(cur.day))}</p>
          <p className="text-[32px] leading-none tabular">{nf.format(cur.v)}</p>
          <p className="mt-1.5 text-xs text-muted tabular">
            {last - first >= 0 ? "+" : "−"}
            {plural(Math.abs(last - first), "novo", "novos")} no período
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pills label="Série do gráfico" value={series} options={SERIES} onChange={setSeries} />
          <Pills label="Período do gráfico" value={range} options={RANGES} onChange={setRange} />
        </div>
      </div>

      <div
        className="relative mt-4 min-h-[200px] flex-1 touch-pan-y"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${series}: ${nf.format(last)} hoje, ${nf.format(first)} no início do período de ${range}`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
          <defs>
            <linearGradient id={`${uid}-f`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--z-brand)", stopOpacity: 0.16 }} />
              <stop offset="1" style={{ stopColor: "var(--z-brand)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} vectorEffect="non-scaling-stroke" strokeDasharray="1 5" style={{ stroke: "var(--z-border-strong)" }} />
          ))}
          <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${uid}-f)`} />
          <path
            key={`${range}-${series}`}
            d={line}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{
              stroke: "var(--z-brand)",
              strokeDasharray: 1,
              strokeDashoffset: mounted || reduced ? 0 : 1,
              transition: reduced ? "none" : `stroke-dashoffset 700ms ${EASE}`,
            }}
          />
        </svg>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-border-strong" style={{ left: `${(curXY[0] / W) * 100}%`, opacity: hover === null ? 0 : 1 }} />
        <span
          aria-hidden
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-brand"
          style={{ left: `${(curXY[0] / W) * 100}%`, top: `${(curXY[1] / H) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted tabular" aria-hidden>
        {ticks.map((d, i) => (
          <span key={i}>{i === ticks.length - 1 ? "Hoje" : tickFmt.format(asDate(d))}</span>
        ))}
      </div>
    </div>
  );
}

/* Barras horizontais de uma série: rótulo, barra proporcional e valor em texto. */
export function HBars({ items, unit = "" }: { items: { label: string; value: number; max: number; note?: string }[]; unit?: string }) {
  const mounted = useMounted();
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={it.label} className="text-xs">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate">{it.label}</span>
            <span className="shrink-0 text-muted tabular">
              {nf.format(it.value)}
              {unit}
              {it.note ? ` · ${it.note}` : ""}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: mounted ? `${it.max ? (it.value / it.max) * 100 : 0}%` : "0%", transition: `width 600ms ${EASE} ${150 + i * 60}ms` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Meia-lua de progresso (passos concluídos). */
export function Gauge({ done, total }: { done: number; total: number }) {
  const mounted = useMounted();
  const t = total ? done / total : 0;
  const len = Math.PI * 62;
  return (
    <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden>
      <path d="M 13 78 A 62 62 0 0 1 137 78" fill="none" strokeWidth="10" strokeLinecap="round" style={{ stroke: "var(--z-surface-2)" }} />
      <path
        d="M 13 78 A 62 62 0 0 1 137 78"
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={len}
        style={{ stroke: "var(--z-brand)", strokeDashoffset: len * (1 - (mounted ? t : 0)), transition: `stroke-dashoffset 800ms ${EASE}` }}
      />
    </svg>
  );
}

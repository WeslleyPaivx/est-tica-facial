export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-forest text-sm text-white">Z</span>
      {!compact ? <span className="text-[17px] tracking-tight">Zaniva</span> : <span className="sr-only">Zaniva</span>}
    </span>
  );
}

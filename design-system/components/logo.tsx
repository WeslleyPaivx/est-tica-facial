// A logo da Zaniva: a palavra "zaniva." em minúsculas, com o ponto final; recolhida, o monograma "z.".
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="text-[24px] leading-none tracking-[-0.03em]" aria-label="Zaniva">
      <span aria-hidden>{compact ? "z." : "zaniva."}</span>
    </span>
  );
}

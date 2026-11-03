import type { HTMLAttributes } from "react";
import { cx } from "./cx";

// Filtro SVG de refração, renderizado uma vez no layout. Escala baixa: refração quase imperceptível.
export function GlassFilterDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="z-refraction" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="1" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export function GlassSurface({ className, refract = false, ...p }: HTMLAttributes<HTMLDivElement> & { refract?: boolean }) {
  return <div className={cx("z-glass", refract && "z-glass-refract", className)} {...p} />;
}

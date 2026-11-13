import React from 'react';
import {Img, staticFile} from 'remotion';
import {EASE, mix, tw} from '../anim';
import {BRAND, COLORS, FONT} from '../config';

const L = BRAND.logo;

// Revela o wordmark oficial (recorte do arquivo da marca, sem redesenho):
// o ponto formado pelos cartões percorre a linha de base "escrevendo" a logo e pousa como o ponto final.
export const BrandReveal: React.FC<{frame: number}> = ({frame}) => {
  const start = {x: L.left - 8, y: L.top + L.dotY};
  const end = {x: L.left + L.dotX, y: L.top + L.dotY};
  const travel = tw(frame, BRAND.travelStart, BRAND.writeStart, 0, 1, EASE.inOut);
  const write = tw(frame, BRAND.writeStart, BRAND.writeEnd, 0, 1, EASE.inOut);
  const done = frame >= BRAND.writeEnd;

  const x = mix(mix(BRAND.center.x, start.x, travel), end.x, write);
  const y = mix(BRAND.center.y, start.y, travel) - Math.sin(Math.PI * travel) * 70;
  const size = mix(66, L.dotSize, travel) * tw(frame, BRAND.dotPop, BRAND.dotPop + 16, 0, 1, EASE.back);
  const stretch = 1 + Math.sin(Math.PI * write) * 0.9 + Math.sin(Math.PI * travel) * 0.4;
  const edge = done ? L.w : frame < BRAND.writeStart ? 0 : Math.max(0, x - L.left - 20);

  const sig = tw(frame, BRAND.signatureAt, BRAND.signatureAt + 50, 0, 1, EASE.out);
  const glow = tw(frame, BRAND.glowAt, BRAND.glowAt + 70, 0, 1, EASE.soft);
  const box: React.CSSProperties = {position: 'absolute', left: L.left, top: L.top, width: L.w, height: L.h};
  const mask = `url(${staticFile(L.src)})`;

  return (
    <>
      <Img src={staticFile(L.src)} style={{...box, clipPath: `inset(0 ${L.w - edge}px 0 0)`}} />
      {glow > 0 && glow < 1 && (
        <div
          style={{
            ...box,
            background: 'linear-gradient(105deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 58%)',
            backgroundSize: '300% 100%',
            backgroundPosition: `${100 - glow * 100}% 0`,
            WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
          }}
        />
      )}
      {!done && (
        <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size, background: COLORS.ink, transform: `scaleX(${stretch})`, transformOrigin: '100% 50%'}} />
      )}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: L.top + L.h + 62, textAlign: 'center',
          fontFamily: FONT.family, fontSize: 40, color: COLORS.plum,
          letterSpacing: `${mix(0.6, 0.08, sig)}em`, paddingLeft: `${mix(0.6, 0.08, sig)}em`,
          opacity: Math.min(1, sig * 1.6), filter: sig < 0.8 ? `blur(${(0.8 - sig) * 8}px)` : undefined,
        }}
      >
        {BRAND.signature}
      </div>
    </>
  );
};

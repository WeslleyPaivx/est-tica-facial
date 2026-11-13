import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EASE, mix, sp, tw} from '../anim';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {BrandReveal} from '../components/BrandReveal';
import {Icon} from '../components/Icons';
import {PerspectiveCamera} from '../components/PerspectiveCamera';
import {BRAND, COLORS, FONT} from '../config';

// CENA 05 — BRAND REVEAL: os cartões viram um ponto, a cor da marca se espalha e a logo é revelada.
export const Scene05Brand: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < BRAND.dotPop) return null;
  const r = tw(frame, BRAND.ripple, BRAND.ripple + 80, 0, 1400, EASE.out);
  const {x: cx, y: cy} = BRAND.center;
  const logoY = BRAND.logo.top + BRAND.logo.h / 2;
  const btn = sp(frame, BRAND.buttonAt, {damping: 13, stiffness: 120});
  const sheen = tw(frame, BRAND.buttonAt + 50, BRAND.buttonAt + 110, 0, 1, EASE.soft);
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 44%, #F9F7FE 0%, ${COLORS.brandBg} 50%, ${COLORS.brandBgDeep} 100%)`, clipPath: `circle(${r}px at ${cx}px ${cy}px)`}} />
      {r > 0 && r < 1380 && (
        <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', boxSizing: 'border-box', border: `3px solid ${COLORS.plum}`, opacity: 0.3 * (1 - r / 1400)}} />
      )}
      <PerspectiveCamera>
        {[330, 480, 660].map((radius, i) => {
          const p = tw(frame, BRAND.ripple + 14 + i * 10, BRAND.ripple + 100 + i * 10, 0, 1, EASE.out);
          const s = mix(0.55, 1, p) + Math.sin(frame / 90 + i) * 0.012;
          return (
            <div key={i} style={{position: 'absolute', left: cx - radius, top: logoY - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', boxSizing: 'border-box', border: `1.5px solid rgba(97,67,109,${0.16 - i * 0.04})`, background: i === 0 ? 'radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 70%)' : undefined, opacity: p, transform: `translateZ(${-160 - i * 220}px) scale(${s})`}} />
          );
        })}
      </PerspectiveCamera>
      <PerspectiveCamera intensity={0.5}>
        <BrandReveal frame={frame} />
        <AnimatedHeadline lines={[BRAND.cta]} start={BRAND.ctaAt} exitAt={9999} top={1300} size={62} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1440, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', overflow: 'hidden', height: 108, borderRadius: 54, padding: '0 34px 0 52px', display: 'flex', alignItems: 'center', gap: 26, background: COLORS.ink, color: '#FFFFFF', fontFamily: FONT.family, fontSize: 37, letterSpacing: '-0.02em', boxShadow: '0 18px 44px rgba(12,10,19,0.22)', opacity: Math.min(1, btn * 2.5), transform: `translateY(${(1 - btn) * 50}px) scale(${mix(0.8, 1, btn)})`}}>
            {BRAND.button}
            <span style={{width: 60, height: 60, borderRadius: 30, background: '#FFFFFF', color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{transform: `translateX(${Math.sin(frame / 14) * 3}px)`}}><Icon name="arrow" size={30} stroke={2.2} /></span>
            </span>
            {sheen > 0 && sheen < 1 && (
              <span style={{position: 'absolute', top: 0, bottom: 0, width: 140, left: `${-30 + sheen * 130}%`, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))'}} />
            )}
          </div>
        </div>
      </PerspectiveCamera>
    </>
  );
};

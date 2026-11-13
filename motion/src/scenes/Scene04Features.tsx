import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, float, mix, sp, tw} from '../anim';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {FeatureCard} from '../components/FeatureCard';
import {FloatingCard} from '../components/FloatingCard';
import {PerspectiveCamera} from '../components/PerspectiveCamera';
import {BRAND, COLORS, FEATURE_CARD, FEATURES, MOTION, PHONE} from '../config';

// CENA 04 — FUNCIONALIDADES: o aparelho gira de perfil e dele saem quatro cartões.
export const Scene04Features: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < FEATURE_CARD.enter || frame > BRAND.ripple + 4) return null;
  return (
    <>
      <PerspectiveCamera>
        {FEATURES.map((f, i) => {
          const s = FEATURE_CARD.enter + i * FEATURE_CARD.stagger;
          if (frame < s) return null;
          const p = sp(frame, s, {damping: 15 + i, stiffness: 80 + i * 8, mass: 1});
          const q = tw(frame, FEATURE_CARD.converge + i * 4, FEATURE_CARD.converge + 44 + i * 3, 0, 1, EASE.anticipate); // convergência para o brand reveal
          const fl = float(frame, i + 30, 6);
          return (
            <FloatingCard
              key={i}
              x={mix(mix(PHONE.x, f.x, p), BRAND.center.x, q) + fl.x * (1 - q)}
              y={mix(mix(PHONE.y, f.y, p), BRAND.center.y, q) + fl.y * (1 - q)}
              z={mix(60, f.z, p) * (1 - q)}
              ry={tw(frame, s, s + 56, -90, f.ry, EASE.out) * (1 - q)}
              rz={f.rz * p + fl.r + q * (i % 2 ? 50 : -50)}
              scale={mix(mix(0.7, 1, p), 0.07, q)}
              opacity={1 - tw(q, 0.88, 1)}
              blur={Math.max(0, 1 - p) * 8 + Math.sin(Math.PI * Math.max(0, Math.min(1, q))) * 6}
              w={FEATURE_CARD.w}
              h={FEATURE_CARD.h}
              radius={36}
              elevation={1.1 + f.z / 150}
            >
              <FeatureCard kind={f.kind} title={f.title} index={i} frame={frame} />
            </FloatingCard>
          );
        })}
      </PerspectiveCamera>
      <PerspectiveCamera intensity={MOTION.textParallax}>
        <AnimatedHeadline lines={['Seu atendimento', 'conectado.']} accentLines={[1]} start={1236} exitAt={1644} top={170} size={92} />
        <AnimatedHeadline lines={['Sua operação mais eficiente.']} start={1400} exitAt={1650} top={410} size={48} color={COLORS.secondary} weight={400} />
      </PerspectiveCamera>
    </>
  );
};

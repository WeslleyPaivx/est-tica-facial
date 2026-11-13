import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, float, mix, sp, tw} from '../anim';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {ChatInterface} from '../components/ChatInterface';
import {FloatingCard} from '../components/FloatingCard';
import {Icon} from '../components/Icons';
import {PerspectiveCamera} from '../components/PerspectiveCamera';
import {PhoneMockup} from '../components/PhoneMockup';
import {CHAT, COLORS, FONT, MOTION, PHONE, SUPPORT_LINES} from '../config';
import {flipAngle} from './shared';

const SIDE_CARDS = [
  {x: 180, y: 648, z: 110, at: 736, icon: 'message', title: 'Nova conversa', sub: 'agora'},
  {x: 880, y: 1010, z: 130, at: 800, icon: 'check', title: 'Respondido', sub: 'em instantes'},
  {x: 175, y: 1500, z: 210, at: 972, icon: 'calendar', title: 'Quinta-feira', sub: 'horários sugeridos'},
];

// CENA 03 — CHATBOT EM AÇÃO: o nó "Chatbot" vira um smartphone com a conversa acontecendo.
export const Scene03Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const theta = flipAngle(frame);
  if (theta < 90 || frame >= PHONE.exitEnd) return null;

  const drift = -14 + tw(frame, PHONE.flipEnd, PHONE.exitStart, 0, 22, EASE.soft) + Math.sin(frame / 80) * 1.5;
  const exit = tw(frame, PHONE.exitStart, PHONE.exitEnd, 0, 1, EASE.in);
  const ry = frame < PHONE.flipEnd ? theta - 180 : mix(drift, 90, exit);
  const scale = mix(0.5, 1, tw(frame, PHONE.flipStart + 30, PHONE.flipEnd + 8, 0, 1, EASE.out)) * mix(1, 0.45, exit);
  // pequeno avanço a cada mensagem enviada/recebida
  const nudge = CHAT.reduce((acc, m) => acc + (frame >= m.at ? Math.exp(-(frame - m.at) / 9) : 0), 0);
  const fl = float(frame, 9, 5);

  return (
    <>
      <PerspectiveCamera>
        <PhoneMockup x={PHONE.x + fl.x} y={PHONE.y + fl.y} z={60 + nudge * 16} w={PHONE.w} h={PHONE.h} rx={4 - nudge * 0.6} ry={ry} scale={scale}>
          <ChatInterface frame={frame} />
        </PhoneMockup>
        {SIDE_CARDS.map((c, i) => {
          const p = sp(frame, c.at, {damping: 14, stiffness: 100});
          const out = tw(frame, PHONE.exitStart - 22 + i * 4, PHONE.exitStart + 4 + i * 4, 0, 1, EASE.in);
          if (frame < c.at) return null;
          const f = float(frame, i + 20, 9);
          const side = c.x < 540 ? -1 : 1;
          return (
            <FloatingCard key={i} x={c.x + side * 260 * (1 - p) + f.x + side * 200 * out} y={c.y + f.y} z={c.z} ry={-side * (10 + 30 * (1 - p))} rz={f.r * 2} scale={mix(0.85, 1, p) * (1 - out * 0.3)} opacity={Math.min(1, p * 3) * (1 - out)} blur={Math.max(0, 1 - p) * 10 + out * 8} w={270} h={104} radius={28} elevation={1.5}>
              <div style={{height: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', fontFamily: FONT.family, color: COLORS.ink}}>
                <div style={{width: 60, height: 60, borderRadius: 18, background: COLORS.plumSoft, color: COLORS.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                  <Icon name={c.icon} size={30} />
                </div>
                <div>
                  <div style={{fontSize: 25, letterSpacing: '-0.02em', fontWeight: FONT.medium, whiteSpace: 'nowrap'}}>{c.title}</div>
                  <div style={{fontSize: 20, color: COLORS.secondary, whiteSpace: 'nowrap'}}>{c.sub}</div>
                </div>
              </div>
            </FloatingCard>
          );
        })}
      </PerspectiveCamera>
      <PerspectiveCamera intensity={MOTION.textParallax}>
        {SUPPORT_LINES.map((l, i) => (
          <AnimatedHeadline key={i} lines={[l.text]} start={l.start} exitAt={l.exitAt} top={270} size={88} />
        ))}
      </PerspectiveCamera>
    </>
  );
};

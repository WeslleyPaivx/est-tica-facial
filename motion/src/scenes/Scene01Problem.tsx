import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {FloatingCard} from '../components/FloatingCard';
import {MessageCard} from '../components/MessageBubble';
import {PerspectiveCamera} from '../components/PerspectiveCamera';
import {MESSAGE_CARD, MESSAGES, MOTION, SCENES} from '../config';
import {messagePose, statusProgress} from './shared';

// CENA 01 — O PROBLEMA: mensagens chegam de todos os lados e ficam sem resposta.
export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > SCENES.problem.to + 30) return null;
  return (
    <>
      {frame < SCENES.problem.to && (
        <PerspectiveCamera>
          {MESSAGES.map((m, i) => {
            const {h, ...pose} = messagePose(i, frame);
            return (
              <FloatingCard key={i} {...pose} w={MESSAGE_CARD.w} h={h} elevation={1 + m.rest.z / 160}>
                <MessageCard message={m} status={statusProgress(i, frame)} pulse={(Math.max(0, frame - (m.statusAt ?? 0)) % 70) / 70} />
              </FloatingCard>
            );
          })}
        </PerspectiveCamera>
      )}
      <PerspectiveCamera intensity={MOTION.textParallax}>
        <AnimatedHeadline lines={['Quantos clientes', 'sua empresa perde', 'por não responder', 'a tempo?']} accentLines={[3]} start={120} exitAt={282} top={190} />
      </PerspectiveCamera>
    </>
  );
};

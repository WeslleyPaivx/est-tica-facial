import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, float, mix, tw} from '../anim';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {AutomationFlow, FlowNode, nodeActive} from '../components/AutomationFlow';
import {FloatingCard} from '../components/FloatingCard';
import {MessageCard} from '../components/MessageBubble';
import {PerspectiveCamera} from '../components/PerspectiveCamera';
import {FLOW, FLOW_NODE, FLOW_NODES, MESSAGE_CARD, MESSAGES, MOTION, PHONE, SCENES} from '../config';
import {flipAngle, messagePose, statusProgress} from './shared';

// CENA 02 — A TRANSFORMAÇÃO: os cartões congelam e se reorganizam num fluxo de automação.
export const Scene02Transform: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SCENES.transform.from || frame > PHONE.flipEnd) return null;
  const theta = flipAngle(frame);
  return (
    <>
      <PerspectiveCamera>
        <AutomationFlow frame={frame} opacity={1 - tw(frame, FLOW.exit - 8, FLOW.exit + 10)} />
        {MESSAGES.map((m, i) => {
          const base = messagePose(i, frame);
          const node = FLOW_NODES[i];
          const t0 = FLOW.morphStart + i * FLOW.morphStagger;
          const t = tw(frame, t0, t0 + FLOW.morphDur, 0, 1, EASE.inOut);
          const fl = float(frame, i + 5, 4);
          const settle = tw(frame, 400, 450, 0, 1, EASE.soft);
          let pose = {
            x: mix(base.x, node.x, t) + fl.x * settle,
            y: mix(base.y, node.y, t) + fl.y * settle,
            z: mix(base.z, 0, t) + Math.sin(Math.PI * t) * 140, // arco em profundidade durante a reorganização
            ry: mix(base.ry, 0, t),
            rz: mix(base.rz, 0, t),
            scale: 1,
            opacity: 1,
            blur: Math.sin(Math.PI * t) * 5,
          };
          let w = mix(MESSAGE_CARD.w, FLOW_NODE.w, t);
          let h = mix(base.h, FLOW_NODE.h, t);
          let content = 1;

          if (i === 1) {
            // o nó "Chatbot" vai ao centro e gira até virar o smartphone
            if (theta >= 90) return null;
            const go = tw(frame, FLOW.exit, PHONE.flipStart + 44, 0, 1, EASE.inOut);
            pose = {...pose, x: mix(pose.x, PHONE.x, go), y: mix(pose.y, PHONE.y, go), z: go * 60, ry: theta, scale: 1 + go * 0.15, blur: 0};
            const grow = tw(theta, 25, 90, 0, 1, EASE.soft);
            w = mix(w, 300, grow);
            h = mix(h, 520, grow);
            content = 1 - tw(theta, 20, 60);
          } else if (frame >= FLOW.exit) {
            // os demais nós saem de quadro passando pela câmera
            const e = tw(frame, FLOW.exit + i * 3, FLOW.exit + i * 3 + 40, 0, 1, EASE.in);
            pose = {...pose, y: pose.y + (i === 0 ? -1 : 1) * 1000 * e, z: pose.z + 420 * e, rz: (i === 0 ? -1 : 1) * 8 * e, opacity: 1 - tw(e, 0.7, 1), blur: e * MOTION.blurMax};
          }

          return (
            <FloatingCard key={i} {...pose} w={w} h={h} elevation={1 + (pose.z > 0 ? pose.z / 200 : 0)}>
              <div style={{position: 'absolute', left: '50%', top: 0, marginLeft: -MESSAGE_CARD.w / 2, opacity: 1 - tw(t, 0, 0.4)}}>
                <MessageCard message={m} status={statusProgress(i, frame)} pulse={0} />
              </div>
              <div style={{position: 'absolute', left: '50%', top: '50%', margin: `${-FLOW_NODE.h / 2}px 0 0 ${-FLOW_NODE.w / 2}px`, opacity: tw(t, 0.5, 1) * content}}>
                <FlowNode index={i} active={nodeActive(frame, i)} />
              </div>
            </FloatingCard>
          );
        })}
      </PerspectiveCamera>
      <PerspectiveCamera intensity={MOTION.textParallax}>
        <AnimatedHeadline lines={['E se o atendimento', 'funcionasse', 'automaticamente?']} accentLines={[2]} start={402} exitAt={552} top={190} />
      </PerspectiveCamera>
    </>
  );
};

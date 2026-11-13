// Poses compartilhadas entre cenas vizinhas: garantem que a passagem de uma cena para a outra não tenha salto.
import {EASE, float, mix, shake, sp, tw} from '../anim';
import {MESSAGE_CARD, MESSAGES, MOTION, PHONE} from '../config';

export const statusProgress = (i: number, frame: number) => {
  const at = MESSAGES[i].statusAt;
  return at === null ? 0 : tw(frame, at, at + 22, 0, 1, EASE.out);
};

// pose do cartão de mensagem i (cena 01 e início da 02)
export const messagePose = (i: number, frame: number) => {
  const m = MESSAGES[i];
  const p = sp(frame, m.start, {damping: 15, stiffness: 95});
  const lift = tw(frame, 100, 150, -170, 0, EASE.inOut); // o grupo desce para abrir espaço ao título
  const alive = 1 - tw(frame, 292, 308, 0, 1, EASE.soft); // congelamento antes da transformação
  const fl = float(frame, i);
  return {
    x: mix(m.from.x, m.rest.x, p) + fl.x * alive,
    y: mix(m.from.y, m.rest.y, p) + lift + fl.y * alive,
    z: mix(m.from.z, m.rest.z, p),
    ry: mix(m.from.ry, m.rest.ry, p),
    rz: mix(m.from.rz, m.rest.rz, p) + fl.r * alive + shake(frame, m.statusAt),
    scale: mix(0.85, 1, p),
    opacity: tw(frame, m.start, m.start + 8),
    blur: Math.max(0, 1 - p) * MOTION.blurMax,
    h: MESSAGE_CARD.h + MESSAGE_CARD.statusH * statusProgress(i, frame),
  };
};

// giro contínuo nó "Chatbot" → smartphone: até 90° mostra o nó, depois o aparelho (θ − 180°)
export const flipAngle = (frame: number) => tw(frame, PHONE.flipStart, PHONE.flipEnd, 0, 166, EASE.inOut);

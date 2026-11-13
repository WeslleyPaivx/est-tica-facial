import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {float, shadow} from './anim';
import {PerspectiveCamera} from './components/PerspectiveCamera';
import {SoundEffectTimeline} from './components/SoundEffectTimeline';
import {COLORS} from './config';
import {Scene01Problem} from './scenes/Scene01Problem';
import {Scene02Transform} from './scenes/Scene02Transform';
import {Scene03Chat} from './scenes/Scene03Chat';
import {Scene04Features} from './scenes/Scene04Features';
import {Scene05Brand} from './scenes/Scene05Brand';

// painéis distantes e desfocados: dão escala e parallax ao espaço
const DEPTH = [
  {x: 90, y: 330, z: -700, w: 360, h: 230, rz: -8},
  {x: 1010, y: 620, z: -900, w: 420, h: 280, rz: 6},
  {x: 40, y: 1120, z: -1000, w: 380, h: 520, rz: 5},
  {x: 1060, y: 1500, z: -650, w: 340, h: 240, rz: -6},
  {x: 250, y: 1840, z: -800, w: 460, h: 260, rz: 4},
];

export const Ad: React.FC<{voiceover: boolean}> = ({voiceover}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 75% at 28% 12%, #FFFFFF 0%, ${COLORS.canvas} 45%, ${COLORS.canvasShade} 100%)`}}>
      <PerspectiveCamera>
        {DEPTH.map((d, i) => {
          const f = float(frame, i + 40, 14);
          return <div key={i} style={{position: 'absolute', left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, borderRadius: 36, background: '#FFFFFF', opacity: 0.55, boxShadow: shadow(1.4), filter: 'blur(3px)', transform: `translate3d(${f.x}px, ${f.y}px, ${d.z}px) rotateZ(${d.rz + f.r}deg)`}} />;
        })}
      </PerspectiveCamera>
      <Scene01Problem />
      <Scene02Transform />
      <Scene03Chat />
      <Scene04Features />
      <Scene05Brand />
      <SoundEffectTimeline voiceover={voiceover} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EASE} from '../anim';
import {CAMERA_KEYS, MOTION} from '../config';

const frames = CAMERA_KEYS.map((k) => k.f);
const track = (frame: number, prop: 'x' | 'y' | 'z' | 'rx' | 'ry') =>
  interpolate(frame, frames, CAMERA_KEYS.map((k) => k[prop]), {easing: EASE.soft, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const cameraAt = (frame: number) => ({
  x: track(frame, 'x') + Math.sin(frame / 90) * 6,
  y: track(frame, 'y') + Math.cos(frame / 110) * 5,
  z: track(frame, 'z'),
  rx: track(frame, 'rx') + Math.sin(frame / 130) * 0.5,
  ry: track(frame, 'ry') + Math.sin(frame / 100 + 1) * 0.8,
});

// Câmera 2.5D: os filhos vivem num espaço 3D (CSS) e são posicionados em px do canvas + translateZ.
export const PerspectiveCamera: React.FC<{intensity?: number; children: React.ReactNode}> = ({intensity = 1, children}) => {
  const c = cameraAt(useCurrentFrame());
  const k = intensity * MOTION.intensity;
  return (
    <AbsoluteFill style={{perspective: MOTION.perspective, perspectiveOrigin: '50% 50%'}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${c.z * k}px) rotateX(${c.rx * k}deg) rotateY(${c.ry * k}deg) translate3d(${-c.x * k}px, ${-c.y * k}px, 0)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

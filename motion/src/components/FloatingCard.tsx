import React from 'react';
import {shadow} from '../anim';
import {COLORS} from '../config';

export type CardPose = {x: number; y: number; z?: number; rx?: number; ry?: number; rz?: number; scale?: number; opacity?: number; blur?: number};

// Cartão branco flutuante, posicionado pelo centro no espaço da câmera.
export const FloatingCard: React.FC<
  CardPose & {w: number; h: number; radius?: number; elevation?: number; background?: string; style?: React.CSSProperties; children?: React.ReactNode}
> = ({x, y, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, blur = 0, w, h, radius = 32, elevation = 1, background = COLORS.card, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: radius,
      background,
      border: `1px solid ${COLORS.line}`,
      boxShadow: shadow(elevation),
      overflow: 'hidden',
      opacity,
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      transform: `translate3d(0,0,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
      ...style,
    }}
  >
    {children}
  </div>
);

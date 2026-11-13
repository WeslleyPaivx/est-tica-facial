import React from 'react';
import {COLORS} from '../config';

// Smartphone 2.5D genérico (sem marca): corpo extrudado em camadas, tela e reflexo que acompanha o giro.
export const PhoneMockup: React.FC<{x: number; y: number; z?: number; w: number; h: number; rx?: number; ry?: number; scale?: number; children: React.ReactNode}> = ({x, y, z = 0, w, h, rx = 0, ry = 0, scale = 1, children}) => {
  const layer: React.CSSProperties = {position: 'absolute', inset: 0, borderRadius: 82};
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `translate3d(0,0,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`}}>
      <div style={{...layer, inset: '40px 30px -30px', background: 'rgba(28,20,48,0.30)', filter: 'blur(46px)', transform: 'translateZ(-70px)'}} />
      {[7, 6, 5, 4, 3, 2, 1].map((i) => (
        <div key={i} style={{...layer, background: i === 7 ? '#3A3644' : '#2A2733', transform: `translateZ(${-i * 3.2}px)`}} />
      ))}
      <div style={{...layer, background: COLORS.ink, boxShadow: 'inset 0 0 0 2px #3A3644'}}>
        <div style={{position: 'absolute', inset: 14, borderRadius: 68, overflow: 'hidden', background: '#FFFFFF'}}>
          {children}
          <div style={{position: 'absolute', top: 22, left: '50%', marginLeft: -72, width: 144, height: 40, borderRadius: 20, background: COLORS.ink}} />
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(112deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.20) 48%, rgba(255,255,255,0) 60%)',
              backgroundSize: '260% 100%',
              backgroundPosition: `${50 + ry * 2.4}% 0`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {EASE, tw} from '../anim';
import {COLORS, FLOW, FLOW_NODE, FLOW_NODES, FONT} from '../config';
import {Icon} from './Icons';

type P = {x: number; y: number};
const segment = (i: number): [P, P, P, P] => {
  const a = {x: FLOW_NODES[i].x, y: FLOW_NODES[i].y + FLOW_NODE.h / 2};
  const d = {x: FLOW_NODES[i + 1].x, y: FLOW_NODES[i + 1].y - FLOW_NODE.h / 2};
  return [a, {x: a.x, y: a.y + 52}, {x: d.x, y: d.y - 52}, d];
};
const bezier = ([a, b, c, d]: [P, P, P, P], t: number): P => {
  const u = 1 - t;
  const k = (p: 'x' | 'y') => u ** 3 * a[p] + 3 * u * u * t * b[p] + 3 * u * t * t * c[p] + t ** 3 * d[p];
  return {x: k('x'), y: k('y')};
};

// posição do pulso: 0..3 = trecho percorrido entre os quatro nós
export const pulseAt = (frame: number) => (frame < FLOW.pulseStart ? -1 : (((frame - FLOW.pulseStart) % FLOW.pulsePeriod) / FLOW.pulsePeriod) * 3);
export const nodeActive = (frame: number, i: number) => tw(frame, FLOW.pulseStart + (i / 3) * FLOW.pulsePeriod - 4, FLOW.pulseStart + (i / 3) * FLOW.pulsePeriod + 14);

// Linhas que conectam os nós + pulso que percorre o fluxo.
export const AutomationFlow: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => {
  const s = pulseAt(frame);
  const dot = s >= 0 ? bezier(segment(Math.min(2, Math.floor(s))), EASE.soft(s - Math.floor(s))) : null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: 'translateZ(-2px)', opacity}}>
      {[0, 1, 2].map((i) => {
        const [a, b, c, d] = segment(i);
        const draw = tw(frame, FLOW.lineStart + i * FLOW.lineStagger, FLOW.lineStart + i * FLOW.lineStagger + FLOW.lineDur, 0, 1, EASE.inOut);
        return (
          <path key={i} d={`M${a.x} ${a.y} C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
            fill="none" stroke={COLORS.plum} strokeOpacity={draw > 0 ? 0.4 : 0} strokeWidth={3.5} strokeLinecap="round" />
        );
      })}
      {dot && (
        <g>
          <circle cx={dot.x} cy={dot.y} r={20} fill={COLORS.plum} opacity={0.16} />
          <circle cx={dot.x} cy={dot.y} r={9} fill={COLORS.plum} />
        </g>
      )}
    </svg>
  );
};

// Conteúdo de um nó do fluxo. `active` 0→1 acende o ícone quando o pulso chega.
export const FlowNode: React.FC<{index: number; active: number}> = ({index, active}) => {
  const n = FLOW_NODES[index];
  return (
    <div style={{width: FLOW_NODE.w, height: FLOW_NODE.h, boxSizing: 'border-box', padding: '0 30px', display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT.family, color: COLORS.ink}}>
      <div style={{position: 'relative', width: 88, height: 88, borderRadius: 26, background: COLORS.plumSoft, flexShrink: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: COLORS.plum, opacity: active}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active > 0.5 ? '#FFFFFF' : COLORS.plum}}>
          <Icon name={n.icon} size={42} />
        </div>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 36, letterSpacing: '-0.025em', fontWeight: FONT.medium}}>{n.label}</div>
        <div style={{fontSize: 25, color: COLORS.secondary, marginTop: 4}}>{n.sub}</div>
      </div>
      <div style={{fontSize: 24, color: COLORS.muted, fontVariantNumeric: 'tabular-nums'}}>0{index + 1}</div>
    </div>
  );
};

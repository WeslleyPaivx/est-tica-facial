import React from 'react';
import {EASE, tw} from '../anim';
import {COLORS, FONT} from '../config';
import {Icon} from './Icons';

const W = 390, H = 250;
const loop = (frame: number, period: number) => (((frame % period) + period) % period) / period;

const Clock: React.FC<{frame: number}> = ({frame}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <circle cx={195} cy={125} r={78} fill="#FFFFFF" stroke={COLORS.line} strokeWidth={2} />
    <circle cx={195} cy={125} r={78} fill="none" stroke={COLORS.plum} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="0.25 0.75" strokeDashoffset={-loop(frame, 240)} />
    {Array.from({length: 12}, (_, k) => (
      <line key={k} x1={195} y1={59} x2={195} y2={k % 3 ? 64 : 69} stroke={COLORS.muted} strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${k * 30} 195 125)`} />
    ))}
    <line x1={195} y1={125} x2={195} y2={88} stroke={COLORS.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${300 + loop(frame, 2880) * 360} 195 125)`} />
    <line x1={195} y1={125} x2={195} y2={72} stroke={COLORS.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${loop(frame, 240) * 360} 195 125)`} />
    <circle cx={195} cy={125} r={7} fill={COLORS.plum} />
  </svg>
);

const Leads: React.FC<{frame: number}> = ({frame}) => {
  const t = loop(frame, 210) * 210;
  return (
    <div style={{position: 'absolute', inset: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      {[true, false, true].map((qualified, k) => {
        const on = tw(t, 30 + k * 34, 46 + k * 34) * (1 - tw(t, 190, 208));
        return (
          <div key={k} style={{height: 56, borderRadius: 18, background: '#FFFFFF', border: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', opacity: qualified ? 1 : 1 - on * 0.55, transform: `translateX(${qualified ? on * 10 : 0}px)`}}>
            <span style={{width: 32, height: 32, borderRadius: 16, background: COLORS.surface}} />
            <span style={{flex: 1, height: 10, borderRadius: 5, background: COLORS.surface, marginRight: 30 + k * 26}} />
            <span style={{width: 34, height: 34, borderRadius: 17, background: qualified ? COLORS.plum : COLORS.surface, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${qualified ? on : 0})`}}>
              <Icon name="check" size={20} stroke={2.6} />
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Calendar: React.FC<{frame: number}> = ({frame}) => {
  const picks = [9, 17, 5, 19];
  const t = loop(frame, 240) * 240;
  return (
    <div style={{position: 'absolute', inset: '30px 36px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 10}}>
      {Array.from({length: 28}, (_, k) => {
        const order = picks.indexOf(k);
        const on = order < 0 ? 0 : tw(t, 20 + order * 46, 34 + order * 46, 0, 1, EASE.back) * (1 - tw(t, 222, 238));
        return <span key={k} style={{borderRadius: 10, background: on > 0.02 ? COLORS.plum : '#FFFFFF', border: `1px solid ${COLORS.line}`, opacity: on > 0.02 ? 0.25 + 0.75 * on : 1, transform: `scale(${1 + Math.sin(Math.PI * Math.min(1, on)) * 0.18})`}} />;
      })}
    </div>
  );
};

const Crm: React.FC<{frame: number}> = ({frame}) => {
  const node: React.CSSProperties = {position: 'absolute', top: 77, width: 96, height: 96, borderRadius: 28, background: '#FFFFFF', border: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.plum};
  const arrive = Math.sin(Math.PI * tw(loop(frame, 70), 0.85, 1)) + Math.sin(Math.PI * tw(loop(frame, 70), 0, 0.15));
  return (
    <>
      <div style={{position: 'absolute', left: 136, right: 136, top: 124, borderTop: `3px dashed ${COLORS.muted}`, opacity: 0.6}} />
      {[0, 0.5].map((phase) => {
        const u = loop(frame + phase * 70, 70);
        return <span key={phase} style={{position: 'absolute', top: 117, left: 136 + u * 104, width: 16, height: 16, borderRadius: 8, background: COLORS.plum, opacity: Math.sin(Math.PI * u)}} />;
      })}
      <div style={{...node, left: 40}}><Icon name="message" size={44} /></div>
      <div style={{...node, left: 254, background: COLORS.plum, color: '#FFFFFF', transform: `scale(${1 + arrive * 0.03})`}}><Icon name="grid" size={44} /></div>
    </>
  );
};

const ART = {clock: Clock, leads: Leads, calendar: Calendar, crm: Crm};

// Cartão de funcionalidade: microanimação vetorial em loop + título.
export const FeatureCard: React.FC<{kind: keyof typeof ART; title: string; index: number; frame: number}> = ({kind, title, index, frame}) => {
  const Art = ART[kind];
  return (
    <div style={{padding: 30, fontFamily: FONT.family, color: COLORS.ink}}>
      <div style={{position: 'relative', width: W, height: H, borderRadius: 24, background: COLORS.surface, overflow: 'hidden'}}>
        <Art frame={frame} />
      </div>
      <div style={{fontSize: 22, color: COLORS.muted, marginTop: 26, fontVariantNumeric: 'tabular-nums'}}>0{index + 1}</div>
      <div style={{fontSize: 38, lineHeight: 1.16, letterSpacing: '-0.03em', fontWeight: FONT.medium, marginTop: 8, whiteSpace: 'pre-line'}}>{title}</div>
    </div>
  );
};

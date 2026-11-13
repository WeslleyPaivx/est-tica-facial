import React from 'react';
import {interpolate} from 'remotion';
import {EASE, sp, tw} from '../anim';
import {CHAT, COLORS, FONT, SCHEDULE} from '../config';
import {Icon} from './Icons';
import {MessageBubble} from './MessageBubble';

const TypingDots: React.FC<{frame: number}> = ({frame}) => (
  <div style={{display: 'flex', gap: 8, padding: '10px 4px'}}>
    {[0, 1, 2].map((k) => (
      <span key={k} style={{width: 12, height: 12, borderRadius: 6, background: COLORS.muted, transform: `translateY(${-Math.max(0, Math.sin(frame / 6 - k * 0.9)) * 7}px)`}} />
    ))}
  </div>
);

const ScheduleCard: React.FC<{frame: number}> = ({frame}) => {
  const appear = sp(frame, SCHEDULE.at, {damping: 18});
  const tap = tw(frame, SCHEDULE.tapAt, SCHEDULE.tapAt + 14);
  const press = Math.sin(Math.PI * tw(frame, SCHEDULE.tapAt - 4, SCHEDULE.tapAt + 12, 0, 1, EASE.soft));
  return (
    <div style={{display: 'grid', gridTemplateRows: `${Math.min(1, appear * 1.4)}fr`}}>
      <div style={{minHeight: 0, overflow: 'hidden'}}>
        <div style={{margin: '10px 0 16px', padding: 24, borderRadius: 28, border: `1px solid ${COLORS.line}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,20,48,0.07)', transform: `translateY(${(1 - appear) * 30}px) scale(${0.9 + 0.1 * appear})`, transformOrigin: '0% 100%', opacity: Math.min(1, appear * 2)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 60, height: 60, borderRadius: 18, background: COLORS.plumSoft, color: COLORS.plum, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name="calendar" size={30} />
            </div>
            <div>
              <div style={{fontSize: 27, letterSpacing: '-0.02em', fontWeight: FONT.medium}}>{SCHEDULE.title}</div>
              <div style={{fontSize: 21, color: COLORS.muted, marginTop: 3}}>{SCHEDULE.note}</div>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, padding: '0 6px'}}>
            {['S', 'T', 'Q', 'Q', 'S'].map((d, k) => (
              <span key={k} style={{width: 58, height: 58, borderRadius: 29, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: k === 3 ? COLORS.plumSoft : 'transparent', color: k === 3 ? COLORS.plum : COLORS.muted}}>{d}</span>
            ))}
          </div>
          <div style={{display: 'flex', gap: 12, marginTop: 16}}>
            {SCHEDULE.slots.map((slot, k) => {
              const chip = sp(frame, SCHEDULE.at + 14 + k * 7, {damping: 14});
              const on = k === SCHEDULE.tapIndex ? tap : 0;
              return (
                <div key={k} style={{flex: 1, height: 66, borderRadius: 33, boxSizing: 'border-box', border: `1.5px solid ${on > 0.5 ? COLORS.plum : COLORS.line}`, background: on > 0.5 ? COLORS.plum : '#FFFFFF', color: on > 0.5 ? '#FFFFFF' : COLORS.ink, fontSize: 27, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chip * (k === SCHEDULE.tapIndex ? 1 - press * 0.08 : 1)})`, boxShadow: k === SCHEDULE.tapIndex && tap > 0 && tap < 1 ? `0 0 0 ${tap * 16}px rgba(97,67,109,${0.25 * (1 - tap)})` : undefined}}>
                  {slot}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interface de conversa fictícia, 100% dirigida pelo frame (digitação, envio, indicador, rolagem).
export const ChatInterface: React.FC<{frame: number}> = ({frame}) => {
  const typingNow = CHAT.find((m) => m.from === 'client' && frame >= m.typeStart && frame < m.at);
  const typed = typingNow ? typingNow.text.slice(0, Math.floor(interpolate(frame, [typingNow.typeStart, typingNow.at - 8], [0, typingNow.text.length], {extrapolateRight: 'clamp'}))) : '';
  const sendPress = Math.max(...CHAT.filter((m) => m.from === 'client').map((m) => Math.sin(Math.PI * tw(frame, m.at - 5, m.at + 9, 0, 1, EASE.soft))));
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: FONT.family, color: COLORS.ink, background: '#FFFFFF'}}>
      <div style={{height: 76, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', fontSize: 24, fontWeight: FONT.medium, fontVariantNumeric: 'tabular-nums'}}>
        <span>9:41</span>
        <span style={{display: 'flex', gap: 6, alignItems: 'flex-end'}}>
          {[10, 14, 18, 22].map((hh) => <span key={hh} style={{width: 5, height: hh, borderRadius: 2, background: COLORS.ink}} />)}
          <span style={{width: 40, height: 20, borderRadius: 6, border: `2px solid ${COLORS.ink}`, marginLeft: 8, boxSizing: 'border-box', padding: 2}}><span style={{display: 'block', width: '75%', height: '100%', borderRadius: 2, background: COLORS.ink}} /></span>
        </span>
      </div>
      <div style={{height: 104, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderBottom: `1px solid ${COLORS.line}`}}>
        <span style={{color: COLORS.secondary}}><Icon name="chevron" size={34} /></span>
        <div style={{width: 64, height: 64, borderRadius: 32, background: COLORS.plum, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="bot" size={32} /></div>
        <div>
          <div style={{fontSize: 28, letterSpacing: '-0.02em', fontWeight: FONT.medium}}>Assistente virtual</div>
          <div style={{fontSize: 21, color: COLORS.secondary, display: 'flex', alignItems: 'center', gap: 8, marginTop: 2}}>
            <span style={{width: 10, height: 10, borderRadius: 5, background: COLORS.online}} />online
          </div>
        </div>
      </div>
      {/* lista ancorada no topo enquanto cabe; quando passa da altura, rola para cima sozinha */}
      <div style={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 22px'}}>
        <div style={{flexShrink: 0, minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 18, boxSizing: 'border-box'}}>
          <div style={{alignSelf: 'center', fontSize: 20, color: COLORS.muted, background: COLORS.surface, padding: '6px 18px', borderRadius: 16, marginBottom: 12}}>Hoje</div>
          {CHAT.map((m, k) => (
            <React.Fragment key={k}>
              {m.from === 'assistant' && frame < m.at + 8 && (
                <MessageBubble from="assistant" appear={tw(frame, m.typeStart, m.typeStart + 12)} collapse={tw(frame, m.at - 4, m.at + 6)}>
                  <TypingDots frame={frame} />
                </MessageBubble>
              )}
              <MessageBubble from={m.from} appear={sp(frame, m.at, {damping: 15, stiffness: 150})}>{m.text}</MessageBubble>
            </React.Fragment>
          ))}
          <ScheduleCard frame={frame} />
          <MessageBubble from="assistant" appear={tw(frame, SCHEDULE.tapAt + 24, SCHEDULE.tapAt + 38)}>
            <TypingDots frame={frame} />
          </MessageBubble>
        </div>
      </div>
      <div style={{height: 112, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px 10px', borderTop: `1px solid ${COLORS.line}`}}>
        <div style={{flex: 1, height: 68, borderRadius: 34, background: COLORS.surface, display: 'flex', alignItems: 'center', padding: '0 26px', fontSize: 26, whiteSpace: 'nowrap', overflow: 'hidden', color: typed ? COLORS.ink : COLORS.muted}}>
          <span style={{flex: 1, minWidth: 0, display: 'flex', justifyContent: typed.length > 24 ? 'flex-end' : 'flex-start', overflow: 'hidden'}}>
            <span>{typed || 'Mensagem'}</span>
          </span>
          {typingNow && <span style={{width: 2.5, height: 32, marginLeft: 3, background: COLORS.plum, opacity: frame % 36 < 22 ? 1 : 0}} />}
        </div>
        <div style={{width: 68, height: 68, borderRadius: 34, background: COLORS.plum, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - sendPress * 0.14})`}}>
          <Icon name="send" size={32} stroke={2.2} />
        </div>
      </div>
    </div>
  );
};

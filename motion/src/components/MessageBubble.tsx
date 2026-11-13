import React from 'react';
import {COLORS, FONT, Message, MESSAGE_CARD} from '../config';

const initials = (name: string) => name.split(' ').map((p) => p[0]).join('');

// Cartão de mensagem recebida (cena 01). `status` 0→1 abre o selo "sem resposta".
export const MessageCard: React.FC<{message: Message; status: number; pulse: number}> = ({message, status, pulse}) => (
  <div style={{fontFamily: FONT.family, color: COLORS.ink, width: MESSAGE_CARD.w}}>
    <div style={{height: MESSAGE_CARD.h, boxSizing: 'border-box', padding: '0 30px', display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{width: 72, height: 72, borderRadius: 36, background: COLORS.surface, color: COLORS.secondary, fontSize: 26, fontWeight: FONT.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        {initials(message.name)}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, color: COLORS.secondary, marginBottom: 8}}>
          <span>{message.name}</span>
          <span style={{color: COLORS.muted, fontVariantNumeric: 'tabular-nums'}}>{message.time}</span>
        </div>
        <div style={{fontSize: 34, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{message.text}</div>
      </div>
    </div>
    <div style={{height: MESSAGE_CARD.statusH, boxSizing: 'border-box', borderTop: `1px solid ${COLORS.line}`, padding: '0 30px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, color: COLORS.alert, opacity: status}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: COLORS.alert, boxShadow: `0 0 0 ${pulse * 9}px rgba(196,71,43,${0.28 * (1 - pulse)})`}} />
      {message.status}
    </div>
  </div>
);

// Balão de conversa (cena 03). `appear` 0→1: a linha cresce (grid fr) e o balão salta do canto.
export const MessageBubble: React.FC<{from: 'client' | 'assistant'; appear: number; collapse?: number; children: React.ReactNode}> = ({from, appear, collapse = 0, children}) => {
  const mine = from === 'client';
  const open = Math.min(1, appear * 1.6) * (1 - collapse);
  return (
    <div style={{display: 'grid', gridTemplateRows: `${open}fr`}}>
      <div style={{minHeight: 0, overflow: 'hidden', display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start'}}>
        <div
          style={{
            margin: '9px 0',
            maxWidth: '80%',
            padding: '15px 22px',
            borderRadius: 28,
            borderBottomRightRadius: mine ? 8 : 28,
            borderBottomLeftRadius: mine ? 28 : 8,
            background: mine ? COLORS.plum : COLORS.surface,
            color: mine ? '#FFFFFF' : COLORS.ink,
            fontSize: 30,
            lineHeight: 1.32,
            letterSpacing: '-0.01em',
            transform: `translateY(${(1 - appear) * 22}px) scale(${0.7 + 0.3 * appear})`,
            transformOrigin: mine ? '100% 100%' : '0% 100%',
            opacity: Math.min(1, appear * 2.5) * (1 - collapse),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, tw} from '../anim';
import {COLORS, FONT} from '../config';

// Tipografia cinética: cada linha é revelada por máscara, palavra a palavra (stagger).
export const AnimatedHeadline: React.FC<{
  lines: string[];
  start: number;
  exitAt: number;
  top: number;
  size?: number;
  color?: string;
  accentLines?: number[];
  weight?: number;
}> = ({lines, start, exitAt, top, size = 86, color = COLORS.ink, accentLines = [], weight = FONT.medium}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > exitAt + 40) return null;
  let word = 0;
  return (
    <div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center', fontFamily: FONT.family, fontWeight: weight, fontSize: size, letterSpacing: '-0.035em', color}}>
      {lines.map((line, li) => (
        <div key={li} style={{overflow: 'hidden', lineHeight: 1.3, marginBottom: '-0.16em', color: accentLines.includes(li) ? COLORS.plum : undefined}}>
          {line.split(' ').map((w, wi) => {
            const i = word++;
            const enter = tw(frame, start + i * 4, start + i * 4 + 38, 0, 1, EASE.out);
            const exit = tw(frame, exitAt + li * 3, exitAt + li * 3 + 20, 0, 1, EASE.in);
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  transform: `translateY(${(1 - enter) * 115 - exit * 115}%) rotate(${(1 - enter) * 5}deg)`,
                  transformOrigin: '0% 100%',
                  filter: enter < 0.7 ? `blur(${(0.7 - enter) * 8}px)` : undefined,
                }}
              >
                {w + (wi < line.split(' ').length - 1 ? ' ' : '')}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

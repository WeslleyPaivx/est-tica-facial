import React from 'react';

const PATHS: Record<string, React.ReactNode> = {
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6" /></>,
  bot: <><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><path d="M9 11.5h.01M15 11.5h.01" strokeWidth="2.6" /></>,
  filter: <path d="M4 5h16l-6.2 7.4v5.4l-3.6 1.8v-7.2L4 5Z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  send: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
  chevron: <path d="m14.5 5-7 7 7 7" />,
  arrow: <path d="M4 12h16M13.5 5.5 20 12l-6.5 6.5" />,
  message: <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>,
};

export const Icon: React.FC<{name: string; size?: number; color?: string; stroke?: number}> = ({name, size = 24, color = 'currentColor', stroke = 1.8}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
    {PATHS[name]}
  </svg>
);

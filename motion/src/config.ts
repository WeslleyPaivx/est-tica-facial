// Configuração central do comercial: tudo que um editor costuma ajustar está aqui.
export const VIDEO = {id: 'ZanivaAd', width: 1080, height: 1920, fps: 60, durationInFrames: 2100};

export const SCENES = {
  problem: {from: 0, to: 300},
  transform: {from: 300, to: 600},
  chat: {from: 600, to: 1140},
  features: {from: 1140, to: 1680},
  brand: {from: 1680, to: 2100},
};

// Cores extraídas do arquivo oficial da logo (fundo, tinta do wordmark e ameixa da assinatura).
export const COLORS = {
  canvas: '#F7F7F9',
  canvasShade: '#ECEBF0',
  card: '#FFFFFF',
  ink: '#0C0A13',
  secondary: '#625E6E',
  muted: '#9A97A6',
  line: 'rgba(12,10,19,0.08)',
  plum: '#61436D',
  plumSoft: '#EFE9F2',
  brandBg: '#F1EEF9',
  brandBgDeep: '#E7E2F3',
  surface: '#F3F2F7',
  alert: '#C4472B',
  online: '#2E9E6B',
};

export const FONT = {family: "'Inter', system-ui, sans-serif", regular: 400, medium: 500, semibold: 600};

export const MOTION = {
  intensity: 1, // multiplicador global do movimento de câmera
  textParallax: 0.3, // quanto a camada de texto acompanha a câmera
  floatAmp: 7, // amplitude (px) da flutuação dos cartões
  blurMax: 14, // desfoque máximo (px) nas entradas rápidas
  perspective: 1700,
};

// Câmera virtual única para o filme inteiro → continuidade entre cenas sem cortes.
// x/y = deslocamento (px), z = avanço (px, positivo aproxima), rx/ry = graus.
export const CAMERA_KEYS = [
  {f: 0, x: 0, y: 0, z: -300, rx: 15, ry: -14},
  {f: 130, x: 0, y: 0, z: -110, rx: 9, ry: -5},
  {f: 300, x: 0, y: 0, z: -60, rx: 7, ry: 5},
  {f: 390, x: 0, y: 0, z: 50, rx: 3, ry: 0},
  {f: 570, x: 0, y: 0, z: 10, rx: 5, ry: -6},
  {f: 660, x: 0, y: 0, z: 70, rx: 3, ry: 0},
  {f: 1120, x: 0, y: 0, z: 30, rx: 3, ry: 3},
  {f: 1215, x: -70, y: 0, z: -90, rx: 8, ry: 9},
  {f: 1655, x: 70, y: 0, z: -50, rx: 6, ry: -9},
  {f: 1745, x: 0, y: 0, z: -170, rx: 4, ry: 0},
  {f: 1990, x: 0, y: 0, z: 0, rx: 0, ry: 0},
  {f: 2100, x: 0, y: 0, z: 22, rx: 0, ry: 0},
];

type Pose = {x: number; y: number; z: number; ry: number; rz: number};
export type Message = {name: string; time: string; text: string; start: number; statusAt: number | null; status: string; rest: Pose; from: Pose};

// Cena 01 — mensagens de clientes fictícios.
export const MESSAGES: Message[] = [
  {name: 'Mariana S.', time: '09:12', text: 'Olá, gostaria de um orçamento.', start: 6, statusAt: 88, status: 'Sem resposta há 2 h',
    rest: {x: 440, y: 800, z: 30, ry: 7, rz: -2.5}, from: {x: -520, y: 700, z: -500, ry: 42, rz: -14}},
  {name: 'Rafael T.', time: '09:47', text: 'Vocês têm horário disponível?', start: 24, statusAt: null, status: '',
    rest: {x: 640, y: 1030, z: 110, ry: -6, rz: 2}, from: {x: 1620, y: 900, z: -300, ry: -42, rz: 12}},
  {name: 'Camila R.', time: '10:05', text: 'Quanto custa o serviço?', start: 42, statusAt: 106, status: 'Sem resposta há 5 h',
    rest: {x: 430, y: 1245, z: -30, ry: 5, rz: -1.5}, from: {x: -420, y: 1750, z: -600, ry: 36, rz: 10}},
  {name: 'João P.', time: '10:31', text: 'Preciso de atendimento.', start: 60, statusAt: 162, status: 'Sem resposta desde ontem',
    rest: {x: 650, y: 1480, z: 70, ry: -7, rz: 2.5}, from: {x: 1500, y: 1950, z: -400, ry: -38, rz: -12}},
];
export const MESSAGE_CARD = {w: 640, h: 170, statusH: 52};

// Cena 02 — fluxo de automação (cada mensagem vira um nó).
export const FLOW_NODES = [
  {label: 'Cliente', sub: 'Envia uma mensagem', icon: 'user', x: 470, y: 800},
  {label: 'Chatbot', sub: 'Responde na hora', icon: 'bot', x: 610, y: 1040},
  {label: 'Qualificação', sub: 'Entende a necessidade', icon: 'filter', x: 470, y: 1280},
  {label: 'Agendamento', sub: 'Sugere horários', icon: 'calendar', x: 610, y: 1520},
] as const;
export const FLOW_NODE = {w: 500, h: 150};
export const FLOW = {morphStart: 322, morphStagger: 9, morphDur: 54, lineStart: 378, lineStagger: 14, lineDur: 30, pulseStart: 424, pulsePeriod: 96, exit: 566};

// Cena 03 — smartphone e conversa (frames globais).
export const PHONE = {x: 540, y: 1150, w: 580, h: 1200, flipStart: 574, flipEnd: 664, exitStart: 1124, exitEnd: 1162};
export const CHAT = [
  {from: 'client', text: 'Olá! Gostaria de agendar uma avaliação.', typeStart: 664, at: 718},
  {from: 'assistant', text: 'Claro! Qual dia fica melhor para você?', typeStart: 734, at: 780},
  {from: 'client', text: 'Quinta-feira.', typeStart: 812, at: 840},
  {from: 'assistant', text: 'Perfeito! Vou verificar os horários disponíveis.', typeStart: 854, at: 898},
] as const;
export const SCHEDULE = {at: 952, tapAt: 1034, title: 'Horários para quinta-feira', note: 'Exemplo ilustrativo', slots: ['09:30', '14:00', '16:30'], tapIndex: 1};
export const SUPPORT_LINES = [
  {text: 'Respostas rápidas.', start: 690, exitAt: 838},
  {text: 'Conversas naturais.', start: 852, exitAt: 988},
  {text: 'Mais oportunidades.', start: 1002, exitAt: 1108},
];

// Cena 04 — funcionalidades.
export const FEATURES = [
  {kind: 'clock', title: 'Atendimento\n24 horas', x: 300, y: 850, z: 30, ry: 6, rz: -1.2},
  {kind: 'leads', title: 'Qualificação\nde leads', x: 780, y: 910, z: -30, ry: -6, rz: 1.2},
  {kind: 'calendar', title: 'Agendamentos\nautomatizados', x: 300, y: 1370, z: -10, ry: 5, rz: 1},
  {kind: 'crm', title: 'Integração\ncom CRM', x: 780, y: 1430, z: 50, ry: -5, rz: -1},
] as const;
export const FEATURE_CARD = {w: 450, h: 480, enter: 1162, stagger: 7, converge: 1664};

// Cena 05 — assinatura da marca. O wordmark é um recorte do arquivo oficial (sem redesenho).
export const BRAND = {
  center: {x: 540, y: 960},
  logo: {src: 'zaniva-wordmark.png', w: 702, h: 192, left: 189, top: 740, dotX: 674.5, dotY: 165, dotSize: 30},
  signature: 'SOLUÇÕES DIGITAIS',
  cta: 'Automatize seu atendimento.',
  button: 'Solicite uma demonstração',
  dotPop: 1706, ripple: 1716, travelStart: 1722, writeStart: 1750, writeEnd: 1804,
  signatureAt: 1808, glowAt: 1836, ctaAt: 1884, buttonAt: 1926,
};

// ───────────── Som ─────────────
export type SfxName = 'whoosh' | 'click' | 'tick' | 'notify' | 'pop' | 'buzz' | 'pulse' | 'swell' | 'impact' | 'shimmer';
export type SfxCue = {frame: number; sfx: SfxName; volume: number};
export const SFX_FRAMES: Record<SfxName, number> = {whoosh: 36, click: 5, tick: 3, notify: 54, pop: 10, buzz: 18, pulse: 54, swell: 45, impact: 90, shimmer: 156};
export const AUDIO = {music: 'audio/music.wav', musicVolume: 0.62, musicVolumeUnderVoice: 0.34, voice: 'audio/voice.wav', voiceVolume: 0.9, sfxMaster: 1};

const typing = (start: number, end: number): SfxCue[] =>
  Array.from({length: Math.floor((end - start) / 5)}, (_, i) => ({frame: start + i * 5, sfx: 'tick' as const, volume: 0.16}));
const swellInto = (frame: number, volume: number): SfxCue => ({frame: frame - SFX_FRAMES.swell, sfx: 'swell', volume});

export const SFX_CUES: SfxCue[] = [
  // 01 — problema: cada cartão chega com whoosh + notificação; selos de "sem resposta" vibram
  ...MESSAGES.flatMap((m): SfxCue[] => [
    {frame: Math.max(0, m.start - 2), sfx: 'whoosh', volume: 0.3},
    {frame: m.start + 14, sfx: 'notify', volume: 0.22},
    ...(m.statusAt ? [{frame: m.statusAt, sfx: 'buzz' as const, volume: 0.3}] : []),
  ]),
  {frame: 118, sfx: 'whoosh', volume: 0.16},
  // 02 — transformação
  swellInto(FLOW.morphStart, 0.3),
  {frame: FLOW.morphStart, sfx: 'whoosh', volume: 0.42},
  ...FLOW_NODES.map((_, i): SfxCue => ({frame: FLOW.morphStart + i * FLOW.morphStagger + FLOW.morphDur - 6, sfx: 'click', volume: 0.3})),
  {frame: 400, sfx: 'whoosh', volume: 0.16},
  ...[0, 1, 2].map((i): SfxCue => ({frame: FLOW.pulseStart + i * 32, sfx: 'pulse', volume: 0.16})),
  // 03 — chatbot
  swellInto(PHONE.flipStart + 6, 0.3),
  {frame: PHONE.flipStart + 4, sfx: 'whoosh', volume: 0.42},
  {frame: PHONE.flipEnd - 16, sfx: 'impact', volume: 0.34},
  ...typing(CHAT[0].typeStart, CHAT[0].at - 6),
  {frame: CHAT[0].at, sfx: 'pop', volume: 0.36},
  {frame: CHAT[1].at, sfx: 'notify', volume: 0.26},
  ...typing(CHAT[2].typeStart, CHAT[2].at - 6),
  {frame: CHAT[2].at, sfx: 'pop', volume: 0.36},
  {frame: CHAT[3].at, sfx: 'notify', volume: 0.26},
  {frame: SCHEDULE.at, sfx: 'pulse', volume: 0.22},
  {frame: SCHEDULE.tapAt, sfx: 'click', volume: 0.4},
  ...typing(SCHEDULE.tapAt + 30, SCHEDULE.tapAt + 60),
  ...SUPPORT_LINES.map((l): SfxCue => ({frame: l.start - 2, sfx: 'whoosh', volume: 0.13})),
  // 04 — funcionalidades
  swellInto(PHONE.exitStart + 8, 0.3),
  {frame: PHONE.exitStart + 6, sfx: 'whoosh', volume: 0.42},
  ...FEATURES.map((_, i): SfxCue => ({frame: FEATURE_CARD.enter + i * FEATURE_CARD.stagger + 30, sfx: 'click', volume: 0.3})),
  {frame: 1238, sfx: 'pulse', volume: 0.18},
  {frame: 1400, sfx: 'whoosh', volume: 0.13},
  // 05 — brand reveal
  swellInto(FEATURE_CARD.converge + 44, 0.36),
  {frame: FEATURE_CARD.converge, sfx: 'whoosh', volume: 0.36},
  {frame: BRAND.ripple, sfx: 'impact', volume: 0.5},
  {frame: BRAND.writeStart - 4, sfx: 'whoosh', volume: 0.2},
  {frame: BRAND.writeEnd, sfx: 'click', volume: 0.34},
  {frame: BRAND.writeEnd + 2, sfx: 'shimmer', volume: 0.22},
  {frame: BRAND.ctaAt - 2, sfx: 'whoosh', volume: 0.13},
  {frame: BRAND.buttonAt + 4, sfx: 'pop', volume: 0.3},
];

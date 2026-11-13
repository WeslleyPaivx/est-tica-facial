// O mundo da Trilha em coordenadas da faixa: 1672 px de largura (a largura das imagens geradas).
// A faixa é a colina do hero + cinco cenas, cada uma nascida da faixa de baixo da anterior
// (263 px de sobreposição, emendados com degradê). Ver fonte/scripts/montagem.py.
import pontos from './trilha-pontos.json';

export const SRC_W = 1672;
export const SEG_H = 941;
export const BAND = 263;
const passo = SEG_H - BAND; // 678

export const SEGMENTOS = [
  { src: '/img/colina.webp', top: 0, alpha: true },
  { src: '/img/encosta.webp', top: passo * 1 },
  { src: '/img/campo.webp', top: passo * 2 },
  { src: '/img/vale.webp', top: passo * 3 },
  { src: '/img/lago.webp', top: passo * 4 },
  { src: '/img/base.webp', top: passo * 5 },
];
export const STRIP_H = passo * 5 + SEG_H; // 4331

// Ponto do mundo que fica no centro da tela quando o centro da seção passa pelo centro da tela.
export const FOCO = {
  como: 1130,       // encosta, entre a laje e o marco de pedras
  portfolios: 1830, // campo
  vagas: 2470,      // vale com os estúdios e a ponte
  depoimentos: 3060,// lago com o píer
  preco: 3420,      // margem de baixo do lago
  final: 3900,      // porteira, início da trilha
};

// Elementos em primeiro plano (desfocados, mais perto da câmera): andam mais rápido que o chão.
// x, y, w em coordenadas da faixa; f = fator de profundidade; at = Y do mundo em que estão na posição nominal
// (sem at, quando estão no meio da tela). Só nas bordas, para não brigar com o conteúdo.
export const DECOR = [
  { img: 'capim', x: -90, y: 610, w: 560, f: 1.3, at: 0, blur: 1.2 },
  { img: 'faixa', x: 330, y: 760, w: 640, f: 1.3, at: 0, blur: 2.2, mobile: false },
  { img: 'samambaia', x: 1330, y: 1420, w: 540, f: 1.7, blur: 2 },
  { img: 'arbusto', x: -230, y: 2080, w: 560, f: 1.6, blur: 2.4 },
  { img: 'pinheiro', x: 1400, y: 2620, w: 470, f: 1.75, blur: 2.6 },
  { img: 'pedras', x: -220, y: 3260, w: 560, f: 1.6, blur: 2 },
  { img: 'capim', x: 1370, y: 3760, w: 520, f: 1.8, blur: 2.2 },
];

// Eixo da trilha (detectado por cor em fonte/scripts/trilha.py), da mesa até a porteira.
export const TRILHA = pontos;

// Marcos do "Como funciona" na trilha (y da faixa); o x vem do eixo.
export const MARCOS = [
  { n: '01', y: 930 },
  { n: '02', y: 1180 },
  { n: '03', y: 1440 },
];

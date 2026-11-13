# MOTION_ANALYSIS — Zaniva Motion Studio

## Situação da referência

O arquivo `Natan_Works_video_watermark.mp4` **não foi encontrado** no repositório nem nos anexos da sessão
(busca por nome em todo o sistema de arquivos). Portanto **nenhum quadro foi extraído e nenhuma medição de
timing foi feita sobre o vídeo de referência** — tudo abaixo deriva da descrição escrita do briefing
(seção 1, "Características desejadas"), e não de observação do vídeo.

Quando o arquivo for disponibilizado, a análise real pode ser feita com:

```bash
ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration -of compact referencia.mp4
ffmpeg -i referencia.mp4 -vf "fps=2,scale=360:-1,tile=8x6" -frames:v 1 referencia-contato.png   # ritmo geral
ffmpeg -i referencia.mp4 -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep pts_time     # cortes
```

e os parâmetros em `src/config.ts` (easing, intensidade de câmera, stagger) ajustados a partir do que for medido.

## Linguagem visual adotada (a partir do briefing)

| Característica pedida | Como foi implementada |
|---|---|
| Cartões brancos flutuando | `FloatingCard`: branco, borda de 1px, sombra em 3 camadas proporcional à profundidade (`elevation`) |
| Fundo off-white / cinza muito claro | Gradiente radial `#FFFFFF → #F7F7F9 → #ECEBF0`; painéis distantes desfocados para dar escala |
| Profundidade 2.5D e perspectiva sutil | CSS 3D (`perspective: 1700px`, `preserve-3d`); cada elemento tem posição Z própria, o parallax é real |
| Câmera virtual dinâmica | **Uma única câmera para o filme inteiro** (`CAMERA_KEYS`), com 12 keyframes e deriva senoidal leve |
| Texto por máscara + stagger | `AnimatedHeadline`: linha com `overflow: hidden`, palavras sobem com 4 frames de defasagem |
| Rotação/movimento em X, Y, Z | Entradas por mola com rotação Y de ±40° → repouso; arco em Z na reorganização |
| Continuidade nas transições | Nenhum corte: mensagens → nós do fluxo → nó "Chatbot" gira e vira o smartphone → o aparelho gira de perfil e solta os 4 cartões → os cartões colapsam no ponto final da logo |
| Motion blur controlado | Desfoque proporcional ao que falta da mola (máx. 14px), só nas entradas/saídas rápidas |
| Easing sofisticado | Curvas em `anim.ts`: `out` (expo), `inOut`, `soft`, `back` (overshoot moderado), `anticipate` |
| Sound design minimalista | 10 efeitos + trilha 120 BPM sintetizados no projeto, disparados por frame |

## Ritmo

- 120 BPM → 1 tempo = 30 frames, 1 compasso = 120 frames. As entradas de camada da trilha caem em 5s, 10s, 19s e 28s.
- Entradas de cartões em stagger de 18 frames (cena 1), 9 (cena 2) e 7 (cena 4).
- Títulos ficam no mínimo 2,4s em tela; o CTA final fica legível por ~3,5s.

## O que NÃO foi copiado

Sem acesso ao vídeo, não há composição, marca ou conteúdo do criador reproduzidos. Layout, ícones,
ilustrações, tipografia cinética e áudio foram criados do zero para este projeto.

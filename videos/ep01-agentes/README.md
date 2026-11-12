# EP01 — "Contratei 5 funcionários. Nenhum é humano!"

Vídeo 3D vertical (1080×1920, 30 fps, 45 s) feito 100% em código com **HyperFrames + Three.js**. Sem modelos 3D baixados.

## Entrega

| Arquivo | O que é |
|---|---|
| `entrega/ep01-agentes.mp4` | Vídeo final: H.264, AAC (faixa silenciosa até entrar a voz), legendas embutidas |
| `entrega/capa-tiktok.png` / `.jpg` | Capa vertical com título |
| `aprovacao/` | Quadros de aprovação e folha de contato |
| `REVIEW.md` | Conferência (problemas encontrados e corrigidos) |

## Estrutura

```
index.html                 raiz: palco 3D (canvas) + legendas + CTA
compositions/captions.html legendas (gerado — não editar à mão)
compositions/cta.html      "QUER SUA EQUIPE DE IA?" / "COMENTE: AGENTES" (gerado)
timeline.json              falas com início/fim (fonte da verdade do tempo)
assets/js/
  story.js     roteiro: planos de câmera, poses, expressões, eventos — tudo ancorado nas falas
  stage.js     monta a cena, luzes, aplica o estado e desenha cada quadro
  office.js    escritório + camada tecnológica
  lucas.js     Lucas (rig de pose e rosto)
  robots.js    Nexo (mascote reutilizável) e os 5 agentes
  screens.js   telas dos monitores e hologramas
  mat.js       materiais com rim light, caixas chanfradas, brilhos
  util.js      easing, keyframes, piscadas — tudo determinístico
  timeline-data.js, mouth-data.js  (gerados pelos scripts)
assets/vo/                 voz guia (Kokoro) usada só para tempo e boca
falas/                     coloque aqui as falas gravadas (l01.wav … l21.wav)
scripts/                   gerar-voz-guia.sh, build_timeline.py, mouth.py, build_captions.py, capa.mjs
```

## Trocar pela voz do ElevenLabs

1. Exporte cada fala com o id da tabela em `falas/LEIA-ME.md` (`l01.wav` … `l21.wav`; .mp3/.m4a também servem) e coloque em `falas/`.
2. Ajuste os inícios em `scripts/build_timeline.py` (`starts`) se uma fala ficar mais longa e encostar na próxima — o script avisa com um erro.
3. Rode:
   ```bash
   bash scripts/gerar-voz-guia.sh     # corta silêncios, mede, gera timeline.json, timeline-data.js e mouth-data.js
   python3 scripts/build_captions.py  # regenera legendas e CTA
   ```
   Câmera, poses, boca e legendas seguem os novos tempos automaticamente.
4. Para o áudio ir no MP4, adicione os `<audio>` das falas no `index.html` (um por fala, com `id`, `data-start` = início da fala) ou mixe no editor depois.

## Visualizar e renderizar

```bash
npx hyperframes preview --background       # Studio no navegador
npx hyperframes snapshot --at 6.5,28.2,44  # quadros soltos para conferir
npx hyperframes check                      # lint + layout + contraste
npx hyperframes render --quality delivery --player-ready-timeout 180000 -o renders/ep01-video.mp4
node scripts/capa.mjs                      # capa (precisa do Playwright)
```

O render local usa GPU por software e leva ~45 min; com GPU de verdade é bem mais rápido.

## Editar

- **Texto do CTA:** variáveis `cta_question` e `cta_comment` (painel Variables do Studio) ou `scripts/build_captions.py`.
- **Palavras destacadas na legenda:** conjuntos `KEY` (amarelo) e `ORANGE` (laranja) em `scripts/build_captions.py`.
- **Câmera:** lista `SHOTS` em `assets/js/story.js` — cada plano tem posição, alvo e lente no início e no fim.
- **Expressões/poses:** tabelas `P` (corpo) e `X` (rosto) em `story.js`; as chaves no tempo ficam em `lucasPose`/`lucasFace`.
- **Nexo em outro episódio:** importe `buildNexo()` de `assets/js/robots.js`; expressões via `FACE` (`happy`, `wink`, `squint`, `worried`, `talk`).

## Recursos e licenças

- Three.js r187 — MIT (`assets/lib/THREE-LICENSE.txt`)
- GSAP 3.15 — licença padrão gratuita da GreenSock
- Fonte Inter — SIL OFL (`assets/fonts/OFL-inter.txt`)
- Voz guia — Kokoro-82M local (Apache-2.0), apenas para tempo; não vai no vídeo
- Todo o resto (personagens, cenário, telas, hologramas) é gerado em código neste projeto.

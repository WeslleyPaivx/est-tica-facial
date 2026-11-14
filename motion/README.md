# Zaniva Motion — comercial 35s (Remotion)

Anúncio vertical 1080×1920, 60 fps, 2.100 frames, H.264 + AAC. Projeto separado do CRM (pasta `motion/`, dependências próprias).

## Instalação

```bash
cd motion
npm install          # Node 20+ ; FFmpeg só é necessário para o storyboard
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run studio` | Abre o Remotion Studio para editar com preview ao vivo |
| `npm run audio` | Regenera trilha e efeitos em `public/audio/` (síntese determinística) |
| `npm run render:preview` | Preview 540×960 → `renders/zaniva-motion-preview.mp4` |
| **`npm run render`** | **Render final → `renders/zaniva-motion-final.mp4`** |
| `bash scripts/place-voice.sh locucao.mp3` | Recorta a locução e posiciona as frases → `public/audio/voice.wav` |
| `npm run render -- --props='{"voiceover":true}'` | Render final **com narração** |
| `npm run storyboard` | Folha de contato → `renders/zaniva-storyboard.png` |
| `npm run typecheck` | TypeScript |

Sem internet para o Remotion baixar o Chrome? `REMOTION_BROWSER=/caminho/do/chrome npm run render`.
Máquina modesta: `npm run render -- --concurrency=2`, ou por segmentos com `--frames=0-599` etc. (a qualidade não muda).

## Estrutura

```
src/config.ts            cores, fontes, timeline, câmera, posições, intensidades e cues de som
src/anim.ts              easing, tween, mola, flutuação — funções puras do frame
src/components/          FloatingCard, MessageBubble, ChatInterface, PhoneMockup, AutomationFlow,
                         FeatureCard, AnimatedHeadline, PerspectiveCamera, BrandReveal, SoundEffectTimeline
src/scenes/              Scene01Problem … Scene05Brand (+ shared.ts: poses compartilhadas nas transições)
scripts/make-audio.mjs   gerador de áudio (trilha 120 BPM + 10 efeitos)
public/                  logo oficial, wordmark recortado e áudio
```

Toda animação é função de `useCurrentFrame()` — sem `requestAnimationFrame`, timers ou estado assíncrono. Renderizar duas vezes produz o mesmo vídeo.

## Marca

- `public/zaniva-logo-original.png` é o arquivo enviado. `zaniva-wordmark.png` é um **recorte** dele com o fundo convertido em transparência; os contornos não foram redesenhados.
- Cores extraídas do arquivo: fundo `#F1EEF9`, tinta `#0C0A13`, ameixa `#61436D`.
- A assinatura "SOLUÇÕES DIGITAIS" é texto em Inter (o arquivo da logo traz "AGÊNCIA DIGITAL"; o briefing pede "SOLUÇÕES DIGITAIS"). Para trocar: `BRAND.signature` em `src/config.ts`.

## Áudio e licenças

- Trilha e efeitos são originais, gerados por `scripts/make-audio.mjs`; não há samples de terceiros.
- Narração: ver `VOICE_SCRIPT.md`.
- Remotion é gratuito para pessoas físicas e empresas de até 3 pessoas; acima disso exige licença comercial (remotion.dev/license).

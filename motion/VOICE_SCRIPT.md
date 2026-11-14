# VOICE_SCRIPT — narração opcional (pt-BR)

Status: **gravada e aplicada** (ElevenLabs v3, arquivo único enviado pelo proprietário).
`scripts/place-voice.sh` recorta as seis frases pelas pausas e posiciona cada uma na sua cena,
gerando `public/audio/voice.wav`. Entradas usadas no vídeo final: 1,0 s · 6,6 s · 12,0 s · 20,0 s · 29,4 s · 32,0 s.
Os pontos de corte foram achados por detecção de silêncio, não por escuta — confira ouvindo.

A tabela abaixo é o planejamento original (antes da gravação).

## Roteiro com marcações

Ritmo-alvo: ~2,3 palavras/s, sem aceleração artificial. Total falado ≈ 26s + pausas = cabe em 35s.

| # | Entrada | Saída | Frames | Cena | Texto |
|---|---|---|---|---|---|
| 1 | 00:01.0 | 00:05.6 | 60–336 | 01 Problema | Quantas oportunidades sua empresa perde *(pausa curta)* enquanto um cliente espera por resposta? |
| 2 | 00:06.6 | 00:11.4 | 396–684 | 02 Transformação | Com a automação inteligente da Zaniva, *(pausa curta)* seu atendimento ganha agilidade. |
| 3 | 00:12.6 | 00:18.2 | 756–1092 | 03 Chatbot | Responda clientes, *(pausa)* qualifique oportunidades *(pausa)* e facilite agendamentos. |
| 4 | 00:20.0 | 00:24.2 | 1200–1452 | 04 Funcionalidades | Tudo conectado *(pausa curta)* para sua empresa trabalhar melhor. |
| 5 | 00:29.6 | 00:31.4 | 1776–1884 | 05 Marca | Zaniva Soluções Digitais. |
| 6 | 00:32.0 | 00:33.8 | 1920–2028 | 05 CTA | Automatize seu atendimento. |

A frase 5 começa quando o ponto começa a "escrever" a logo (frame 1750) e a 6 coincide com a entrada do botão (frame 1926).

## Texto corrido para ElevenLabs

```
Quantas oportunidades sua empresa perde... enquanto um cliente espera por resposta?

Com a automação inteligente da Zaniva, seu atendimento ganha agilidade.

Responda clientes, qualifique oportunidades e facilite agendamentos.

Tudo conectado, para sua empresa trabalhar melhor.

Zaniva Soluções Digitais.

Automatize seu atendimento.
```

Sugestão de configuração: modelo multilíngue, voz brasileira de tom calmo e seguro, estabilidade ~50%,
similaridade ~75%, velocidade 1.0. Gere cada bloco separadamente se precisar reposicionar as pausas.

## Versão reduzida (se a locução passar de 34s)

```
Quantos clientes sua empresa perde por não responder a tempo?
Com a Zaniva, seu atendimento responde, qualifica e agenda.
Tudo conectado.
Zaniva Soluções Digitais. Automatize seu atendimento.
```

## Como encaixar

1. Exporte a locução como WAV (48 kHz, mono ou estéreo) já com o silêncio inicial de 1s — o arquivo toca a partir do frame 0.
2. Salve em `public/audio/voice.wav`.
3. Renderize com `npm run render -- --props='{"voiceover":true}'`.
   A trilha baixa automaticamente de 0,62 para 0,34 (`AUDIO` em `src/config.ts`).

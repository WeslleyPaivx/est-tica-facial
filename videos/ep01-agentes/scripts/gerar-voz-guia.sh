#!/usr/bin/env bash
# Gera a voz guia (Kokoro local, pt-BR), corta silêncios, aplica timbre e mede as durações.
# Uso: bash scripts/gerar-voz-guia.sh   (requer: pip install kokoro-onnx soundfile; ffmpeg com rubberband)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .hyperframes/raw-vo assets/vo
TRIM="silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse"
: > assets/vo/durations.tsv
while IFS=$'\t' read -r id who voice speed text; do
  src="falas/$id.wav"; for ext in mp3 m4a; do [ -f "falas/$id.$ext" ] && src="falas/$id.$ext"; done
  if [ ! -f "$src" ]; then  # sem gravação real: voz guia de IA
    src=".hyperframes/raw-vo/$id.wav"
    npx hyperframes tts "$text" --voice "$voice" --lang pt-br --speed "$speed" -o "$src" --json >/dev/null </dev/null
  fi
  case $who in
    nexo)  FX="$TRIM,rubberband=pitch=1.12:formant=preserved";;
    verde) FX="$TRIM,rubberband=pitch=1.35,vibrato=f=38:d=0.35,acrusher=bits=10:mix=0.35,aecho=0.8:0.6:18:0.35";;
    *)     FX="$TRIM";;
  esac
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$src" -af "$FX,aresample=48000" -ac 1 -c:a pcm_s16le "assets/vo/$id.wav"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "assets/vo/$id.wav")
  printf "%s\t%s\t%.2f\t%s\n" "$id" "$who" "$d" "$text" >> assets/vo/durations.tsv
done < assets/vo/lines.tsv
python3 scripts/build_timeline.py
python3 scripts/mouth.py

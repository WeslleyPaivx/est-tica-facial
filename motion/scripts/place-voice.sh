#!/usr/bin/env bash
# Recorta as frases da locução (arquivo único) e posiciona cada uma no tempo da cena → public/audio/voice.wav
# Uso: bash scripts/place-voice.sh locucao.mp3
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${1:?informe o arquivo de locução}"
# início e fim de cada frase no arquivo original (s) → entrada no vídeo (s)
CUTS=("0.10 5.17 1.0" "5.77 9.60 6.6" "9.81 13.77 12.0" "13.94 16.61 20.0" "16.95 18.90 29.4" "19.01 20.61 32.0")
filter="" ; mix=""
for i in "${!CUTS[@]}"; do
  read -r a b at <<<"${CUTS[$i]}"
  d=$(awk "BEGIN{print $b-$a}")
  filter+="[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=$(awk "BEGIN{print $d-0.05}"):d=0.05,adelay=$(awk "BEGIN{print $at*1000}"):all=1[v$i];"
  mix+="[v$i]"
done
ffmpeg -hide_banner -loglevel error -y -i "$SRC" -filter_complex "${filter}${mix}amix=inputs=${#CUTS[@]}:normalize=0,apad=whole_dur=35[out]" -map "[out]" -t 35 -ar 48000 -ac 1 public/audio/voice.wav
echo "public/audio/voice.wav"

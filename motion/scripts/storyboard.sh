#!/usr/bin/env bash
# Folha de contato: frames de todas as cenas + frames vizinhos às transições.
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=(40 110 200 280 310 345 440 540 590 612 640 720 800 900 1040 1110 1150 1172 1260 1450 1600 1680 1700 1730 1775 1810 1900 2090)
expr=$(printf "eq(n\\,%s)+" "${FRAMES[@]}")
ffmpeg -hide_banner -loglevel error -y -i renders/zaniva-motion-final.mp4 \
  -vf "select='${expr%+}',scale=360:-1,drawtext=text='%{n}':x=14:y=14:fontsize=22:fontcolor=0x0C0A13:box=1:boxcolor=white@0.8:boxborderw=6,tile=7x4:padding=8:margin=8:color=white" \
  -fps_mode vfr -frames:v 1 -update 1 renders/zaniva-storyboard.png
echo "renders/zaniva-storyboard.png"

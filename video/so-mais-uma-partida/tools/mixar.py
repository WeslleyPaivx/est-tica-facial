# Mixagem final -> assets/som.wav, em -16 LUFS e pico real <= -1.5 dBTP (loudnorm em 2 passadas).
# Vozes no centro; jogo da TV e trilha abaixam sozinhos quando alguém fala (sidechain).
# A trilha entra se existir assets/musica.(mp3|wav), 17 dB abaixo da voz.
import glob, json, re, subprocess

TOTAL = json.loads(re.search(r"ANCHORS = (\[.*\]);", open("src/voz.js").read()).group(1))[-1][0]
musica = (glob.glob("assets/musica.mp3") + glob.glob("assets/musica.wav"))[:1]
ins = ["-i", "assets/voz/vozes.wav", "-i", "assets/sfx/efeitos.wav", "-i", "assets/sfx/quarto.wav", "-i", "assets/sfx/jogo.wav"]
g = ("[0]aformat=channel_layouts=mono,asplit=3[voz][sc1][sc2];"
     "[3]volume=-27dB[jg];[jg][sc1]sidechaincompress=threshold=0.01:ratio=20:attack=10:release=450:makeup=1[jogo];")
mixin = "[voz][1][2][jogo]"
if musica:
    ins += ["-stream_loop", "-1", "-i", musica[0]]
    g += (f"[4]aformat=channel_layouts=mono,atrim=0:{TOTAL},afade=t=in:d=1.5,afade=t=out:st={TOTAL - 2.5}:d=2.5,"
          "volume=-17dB[mu];[mu][sc2]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=500[musica];")
    mixin += "[musica]"
else:
    g += "[sc2]anullsink;"
g += f"{mixin}amix=inputs={mixin.count('[')}:normalize=0:duration=longest,atrim=0:{TOTAL},aformat=channel_layouts=stereo[m]"

def run(extra, out):
    return subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-y", *ins, "-filter_complex", g + extra,
                           "-map", "[o]", "-ar", "44100", *out], capture_output=True, text=True, check=True).stderr
# 1ª passada mede, 2ª aplica valores medidos (resultado linear e exato)
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", run(";[m]loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json[o]", ["-f", "null", "-"])).group(0))
run(f";[m]loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
    f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true[o]", ["assets/som.wav"])
chk = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", "assets/som.wav", "-af", "ebur128=peak=true", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
print("trilha:", musica[0] if musica else "nenhuma ainda")
print(*[l.strip() for l in chk.splitlines()[-12:] if re.search(r"\bI:|Peak:", l)], sep="\n")

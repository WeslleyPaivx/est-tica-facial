# Monta assets/sfx/efeitos.wav: cada som no quadro da ação (pico 1 quadro depois da imagem).
import json, re, numpy as np, soundfile as sf
A = json.loads(re.search(r"ANCHORS = (\[.*\]);", open("src/voz.js").read()).group(1))
def unwarp(o):  # régua da animação -> tempo real do vídeo
    for i in range(1, len(A)):
        if o <= A[i][1]: return A[i-1][0] + (o - A[i-1][1]) / (A[i][1] - A[i-1][1]) * (A[i][0] - A[i-1][0])
    return A[-1][0] + (o - A[-1][1])
assert abs(unwarp(A[5][1]) - A[5][0]) < 1e-9
END, TOTAL, sr = A[-2][0], A[-1][0], 44100
# (ação na régua da animação, som, ganho dB); None = título final
ev = [(4.0,"pop",-6),(9.0,"sparkle",-8),(19.5,"whoosh-short",-10),
      (29.1,"impact-bass-1",-8),(32.2,"whoosh",-12),(36.6,"whoosh-short",-11),(41.0,"pop",-9),(47.1,"whoosh-short",-11),
      (48.6,"click",-6),(49.1,"click-soft",-6),(None,"chime",-10)]
mix = np.zeros(int(TOTAL * sr) + sr)
for o, name, db in ev:
    x, r = sf.read(f"assets/sfx/{name}.wav"); assert r == sr, name
    pk = len(x) / sr if name == "riser" else np.argmax(np.abs(x)) / sr  # o riser termina no impacto
    hit = END + 1.2 if o is None else unwarp(o)
    i = int(max(0, hit + 1/30 - pk) * sr)
    seg = x * 10 ** (db / 20); mix[i:i + len(seg)] += seg[:len(mix) - i]
    print(f"{name:14s} {hit:6.2f}s")
sf.write("assets/sfx/efeitos.wav", mix, sr)

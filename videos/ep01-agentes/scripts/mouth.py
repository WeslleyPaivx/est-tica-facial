"""Envelope de boca (0..1 por quadro a 30 fps) de cada fala em assets/vo -> assets/js/mouth-data.js."""
import json, wave, array, math
tl = json.load(open("timeline.json"))
out = {}
for l in tl["lines"]:
    w = wave.open(l["audio"]); sr = w.getframerate(); a = array.array("h", w.readframes(w.getnframes())); w.close()
    hop = sr // 30
    rms = [math.sqrt(sum(x * x for x in a[i:i + hop]) / max(1, len(a[i:i + hop]))) for i in range(0, len(a), hop)]
    peak = max(rms) or 1
    env, prev = [], 0.0
    for v in rms:
        x = min(1.0, (v / peak) ** 0.7 * 1.15)
        prev = x if x > prev else prev * 0.55 + x * 0.45  # ataque rápido, soltura suave
        env.append(round(prev if prev > 0.08 else 0.0, 2))
    out[l["id"]] = env
assert all(len(v) > 5 for v in out.values())
open("assets/js/mouth-data.js", "w").write("// gerado por scripts/mouth.py — não editar\nexport default " + json.dumps(out) + ";\n")
print({k: len(v) for k, v in out.items()})

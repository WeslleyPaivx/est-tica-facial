# Sincroniza o vídeo com o diálogo ORIGINAL (assets/voz/dialogo.mp3), sem efeito nem corte no áudio.
# Gera: assets/voz/vozes.wav (cópia fiel), assets/voz/layout.json, legendas no index.html,
# src/voz.js (boca = volume de quem fala; âncoras régua real -> régua da animação).
# Rode com o python do venv que tem numpy + soundfile.
import json, re, subprocess, numpy as np, soundfile as sf

# Onde cada fala está no dialogo.mp3 (silêncios + timbre). split = pausa entre as duas frases.
FALAS = [
    ("01", "rapaz", 0.00, 3.99, None, ["Só mais uma partida. Depois eu estudo."]),
    ("02", "diabo", 4.35, 9.95, 8.95, ["Boa! O jogo te recompensa agora.", "Estudar? Só ansiedade!"]),
    ("03", "anjo", 10.27, 14.22, 11.86, ["Você não foge só do estudo.", "Foge do medo de errar."]),
    ("04", "rapaz", 14.70, 17.53, None, ["É... e se eu não entender nada?"]),
    ("05", "diabo", 17.97, 23.66, None, ["Então nem começa! Joga mais!"]),
    ("06", "anjo", 23.99, 30.43, 27.69, ["O jogo alivia a ansiedade por alguns minutos.", "Mas a tarefa continua esperando."]),
    ("07", "rapaz", 30.82, 33.38, None, ["E depois vem a culpa..."]),
    ("08", "anjo", 33.71, 37.89, None, ["Esse alívio imediato alimenta o ciclo da procrastinação."]),
    ("09", "diabo", 38.19, 41.77, None, ["Tá, mas uma partidinha não mata!"]),
    ("10", "anjo", 42.15, 48.37, 45.16, ["Em vez disso, estuda cinco minutos.", "Só uma página, sem buscar perfeição."]),
    ("11", "rapaz", 48.77, 52.25, None, ["Cinco minutos... isso eu consigo."]),
    ("12", "anjo", 52.67, 57.99, 55.19, ["Você não precisa querer começar.", "Precisa tornar o começo menor."]),
]
# Régua antiga (onde a animação foi escrita), uma por fala, mesma ordem
ANTIGA = [(0.3,3.8),(4.2,8.8),(9.3,14.8),(15.6,18.8),(19.2,21.8),(22.3,28.8),(29.5,31.8),(32.3,36.8),(37.2,39.8),(40.3,46.8),(47.3,49.8),(50.3,55.8)]
assert len(FALAS) == len(ANTIGA)
assert all(FALAS[i][3] < FALAS[i + 1][2] for i in range(len(FALAS) - 1)), "falas sobrepostas"

subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", "assets/voz/dialogo.mp3", "-ac", "1", "-ar", "44100", "assets/voz/vozes.wav"], check=True)
x, sr = sf.read("assets/voz/vozes.wav")
END = round(FALAS[-1][3] + 0.3, 2)          # tela final começa logo após a última fala
TOTAL = round(max(END + 3.2, len(x) / sr), 2)
json.dump([{"n": n, "who": w, "start": a, "end": b} for n, w, a, b, _, _ in FALAS], open("assets/voz/layout.json", "w"), indent=1)

# legendas
caps, k = [], 1
for n, w, a, b, sp, txt in FALAS:
    bounds = [a] + ([sp] if sp else []) + [b]
    for i, tx in enumerate(txt):
        caps.append(f'        <p id="c{k:02d}" class="clip cap" data-speaker="{w}" data-start="{bounds[i]:.2f}" '
                    f'data-duration="{bounds[i + 1] - bounds[i]:.2f}" data-track-index="2">{tx}</p>')
        k += 1
h = open("index.html").read()
h = re.sub(r'(<div id="captions"[^>]*>\n)(.*?)(\n      </div>)', lambda m: m.group(1) + "\n".join(caps) + m.group(3), h, flags=re.S)
h = re.sub(r'(id="root" data-composition-id="main" data-start="0" data-duration=")[\d.]+', rf'\g<1>{TOTAL}', h)
for el, off in (("shade", 0), ("end-a", 0.2), ("end-b", 1.2)):
    h = re.sub(rf'(id="{el}" class="clip[^"]*" data-start=")[\d.]+(" data-duration=")[\d.]+', rf'\g<1>{END + off:.2f}\g<2>{TOTAL - END - off:.2f}', h)
    h = re.sub(rf'(tl\.fromTo\("#{el}".*\}}, )[\d.]+\);', rf'\g<1>{END + off:.2f});', h)
h = re.sub(r'tl\.set\(\{\}, \{\}, [\d.]+\);', f'tl.set({{}}, {{}}, {TOTAL});', h)
open("index.html", "w").write(h)

# boca: volume (30 fps) de cada personagem, só dentro das falas dele
fps = 30; N = int(TOTAL * fps) + 2; hop = sr // fps
rms = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])
env = {w: np.zeros(N) for w in ("rapaz", "diabo", "anjo")}
for n, w, a, b, _, _ in FALAS:
    i0, i1 = int(a * fps), min(int(b * fps) + 1, len(rms))
    env[w][i0:i1] = rms[i0:i1]
out = {}
for w, e in env.items():
    out[w] = [round(float(v), 2) for v in np.clip(e / (np.percentile(e[e > 0], 95) + 1e-9), 0, 1)]
anch = ([[0, 0]] if FALAS[0][2] > 0 else []) + [p for f, (oa, ob) in zip(FALAS, ANTIGA) for p in ([f[2], oa], [f[3], ob])] + [[END, 56], [TOTAL, 56 + TOTAL - END]]
assert all(anch[i][0] < anch[i + 1][0] and anch[i][1] < anch[i + 1][1] for i in range(len(anch) - 1)), "âncoras fora de ordem"
open("src/voz.js", "w").write("// gerado por tools/sincronizar.py: volume por personagem a 30 fps e âncoras régua real -> régua da animação\n"
                              f"export const VOZ_FPS = {fps};\nexport const VOZ = {json.dumps(out, separators=(',', ':'))};\nexport const ANCHORS = {json.dumps(anch)};\n")
print(f"falas {len(FALAS)} legendas {k - 1} fim das falas {END}s duração {TOTAL}s")

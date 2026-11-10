# Ambiente do quarto, sintetizado: jogo 8-bit na TV (música, pulos, moedas, pause), cliques do
# controle, tique-taque do relógio, caneta no caderno e um "silêncio de quarto" bem baixo.
# Eventos seguem a animação (régua antiga) e são levados ao tempo real com unwarp().
# Saída: assets/sfx/jogo.wav (vai ser abaixado sob as vozes) e assets/sfx/quarto.wav.
import json, re, numpy as np, soundfile as sf

A = json.loads(re.search(r"ANCHORS = (\[.*\]);", open("src/voz.js").read()).group(1))
def unwarp(o):
    for i in range(1, len(A)):
        if o <= A[i][1]: return A[i-1][0] + (o - A[i-1][1]) / (A[i][1] - A[i-1][1]) * (A[i][0] - A[i-1][0])
    return A[-1][0] + (o - A[-1][1])
SR, TOTAL = 44100, A[-1][0]
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)  # semente fixa: mesmo som sempre
db = lambda d: 10 ** (d / 20)

def add(buf, t, x, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0: return
    buf[i:i + len(x)] += (x * gain)[:len(buf) - i]

def env(n, a=0.004, r=0.03):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr)
    return e

def pulse(freq, dur, duty=0.5, sweep=1.0):
    n = int(dur * SR); f = freq * sweep ** (np.arange(n) / n)
    ph = np.cumsum(f / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0) * env(n)

def tri(freq, dur):
    n = int(dur * SR); ph = (np.arange(n) * freq / SR) % 1.0
    return (4 * np.abs(ph - 0.5) - 1) * env(n, 0.002, 0.02)

def onepole(x, fc, high=False):  # filtro simples de 1 polo
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return x - y if high else y

def lp(x, fc):  # passa-baixa rápido (FFT), sem laço em Python
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f > lo) * (f < hi), len(x))

note = lambda m: 440 * 2 ** ((m - 69) / 12)

jogo = np.zeros(N); quarto = np.zeros(N)
PAUSE = unwarp(48.6)  # ele larga o controle: o jogo pausa

# ---- música 8-bit da TV: C–Am–F–G, 140 bpm, baixo em triângulo + arpejo em pulso 25% ----
beat = 60 / 140; e8 = beat / 2
prog = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]), (41, [53, 57, 60, 65]), (43, [55, 59, 62, 67])]
t, k = 0.0, 0
while t < PAUSE - e8:
    root, arp = prog[(k // 8) % 4]
    add(jogo, t, tri(note(root - 12 + (12 if k % 2 else 0)), e8 * 0.9), 0.32)
    add(jogo, t, pulse(note(arp[k % 4] + 12), e8 * 0.55, 0.25), 0.05)
    if k % 8 in (0, 3, 6):  # "bumbo" de ruído curtinho
        add(jogo, t, rng.uniform(-1, 1, int(0.03 * SR)) * env(int(0.03 * SR), 0.001, 0.025), 0.10)
    t += e8; k += 1

# ---- pulo do bonequinho: na tela ele pula a cada pi/4.2 s (régua da animação) ----
o = 0.0
while o < 48.6:
    add(jogo, unwarp(o), pulse(note(72), 0.12, 0.5, sweep=1.8), 0.05)
    o += np.pi / 4.2
# moedinhas (duas notas)
for o in np.arange(0.9, 48.0, 1.37) + rng.uniform(-0.2, 0.2, len(np.arange(0.9, 48.0, 1.37))):
    tt = unwarp(o)
    add(jogo, tt, pulse(note(79), 0.06, 0.5), 0.035)
    add(jogo, tt + 0.06, pulse(note(84), 0.14, 0.5), 0.035)
# som de pause
for i, m in enumerate([84, 79, 84, 79]):
    add(jogo, PAUSE + i * 0.07, pulse(note(m), 0.06, 0.5), 0.12)
jogo = lp(bp(jogo, 180, 6500), 2800)  # abafado: sem bipe estridente  # som de alto-falante de TV

# ---- cliques dos botões: a mão "aperta" quando sin(13t + s) sobe (mesmo ritmo da animação) ----
def jogando(o): return o < 15.4 or 20.4 < o < 29.1
click = bp(rng.uniform(-1, 1, int(0.012 * SR)), 1500, 7000) * env(int(0.012 * SR), 0.0005, 0.01)
for s in (0, 2):
    kk = 0
    while (o := (2 * np.pi * kk - s) / 13) < 29.1:
        if o > 0 and jogando(o): add(quarto, unwarp(o), click, db(-34 + rng.uniform(-4, 2)))
        kk += 1

# ---- relógio: tique-taque 1 por segundo; acelera junto com os ponteiros (22–29) e para no impacto ----
tick = bp(rng.uniform(-1, 1, int(0.02 * SR)), 2500, 6000) * np.exp(-np.arange(int(0.02 * SR)) / (0.003 * SR))
o, n = 0.3, 0
while o < 29.1 or (31 < o < 56):
    if 29.1 <= o < 31: o = 31; continue
    acel = 1 + 7 * np.clip((o - 22) / 7, 0, 1) if o < 29.1 else 1
    loud = -34 + 10 * np.clip((o - 22) / 7, 0, 1) if o < 29.1 else -36
    add(quarto, unwarp(o), tick * (1 if n % 2 else 0.7), db(loud))
    o += 1 / acel; n += 1

# ---- caneta no caderno (ele escreve a partir de 50.5 na régua da animação) ----
a, b = unwarp(50.5), unwarp(56.0)
nn = int((b - a) * SR); tt = np.arange(nn) / SR
risco = bp(rng.uniform(-1, 1, nn), 2000, 7000) * (0.35 + 0.65 * np.abs(np.sin(tt * 9))) * env(nn, 0.1, 0.3)
add(quarto, a, risco, db(-30))

# ---- silêncio de quarto à noite: ruído marrom grave bem baixo, o tempo todo ----
br = np.cumsum(rng.normal(0, 1, N)); br -= onepole(br, 3)  # ruído marrom sem deriva
br = lp(br, 500); br /= np.abs(br).max()
# shortcut: sem ruído de fundo (pedido: nada de chiado); reative aqui se quiser "ar" de quarto
# quarto += br * db(-44)

for name, x in (("jogo", jogo), ("quarto", quarto)):
    x = x[:int(TOTAL * SR)]
    assert np.isfinite(x).all() and np.abs(x).max() < 4, name
    sf.write(f"assets/sfx/{name}.wav", (x / max(1.0, np.abs(x).max() * 1.12)).astype(np.float32), SR)
    print(name, f"{len(x) / SR:.1f}s", f"pico {20 * np.log10(np.abs(x).max() + 1e-9):.1f} dBFS")
print("pause em", round(PAUSE, 2), "s")

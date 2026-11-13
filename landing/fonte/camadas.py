# Monta as camadas do hero a partir da paisagem gerada (fonte/paisagem.png).
# uso: python3 fonte/camadas.py [--conferir pasta]
#
# 1. Tratamento de cor: céu mais escuro e frio no alto, brilho do horizonte mais baixo, copa com a luz puxada para o
#    rosa (realces rosa-pêssego, meios-tons vermelhos, sombras marrom-escuras quase pretas).
# 2. Crista da copa: a névoa e os morros do fundo são violeta (azul acima do verde); a copa da frente é quente ou
#    verde-escura (azul abaixo do verde). Em cada coluna, a crista é o primeiro ponto, de cima para baixo, em que
#    começa uma faixa contínua de copa. Perto da crista o alfa segue a própria cor (vãos de névoa entre as folhas
#    ficam transparentes), então a borda sai com o recorte das folhas e não como uma linha.
# 3. Saídas em public/img: hero-fundo.webp (a cena inteira tratada), hero-copa.webp (só a copa, com alfa) e as
#    versões de 1100 px para telas pequenas.
import argparse, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('--entrada', default=str(RAIZ / 'fonte/paisagem.png'))
ap.add_argument('--conferir', default='', help='pasta para salvar a máscara e a copa sobre magenta')
a = ap.parse_args()

im = Image.open(a.entrada).convert('RGB')
W, H = im.size
rgb = np.asarray(im).astype(np.float32) / 255.0
yy = (np.arange(H, dtype=np.float32) / H)[:, None]


def blur(arr, r):
    return np.asarray(Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ---------- crista ----------
# medida de "névoa": azul menos verde, suavizada
f = blur(np.clip(rgb[..., 2] - rgb[..., 1] + 0.5, 0, 1), 1.0) - 0.5  # >0 névoa/fundo, <0 copa
p = smoothstep(0.018, -0.006, f)  # 1 = copa
# faixa onde a crista pode estar (fração da altura): mais alta nas laterais, mais baixa no meio
xs = np.arange(W) / W
lo = (0.50 + 0.10 * np.exp(-((xs - 0.5) / 0.22) ** 2)) * H
hi = (0.62 + 0.12 * np.exp(-((xs - 0.5) / 0.22) ** 2)) * H
# borda: copa logo abaixo, névoa logo acima (média de 6 px de cada lado)
pp = np.pad(p, ((7, 7), (0, 0)), mode='edge')
below = sum(pp[7 + k:7 + k + H] for k in range(1, 7)) / 6
above = sum(pp[7 - k:7 - k + H] for k in range(1, 7)) / 6
edge = below - above
# caminho de maior borda, coluna a coluna, com passo vertical de até 6 px (copa tem lado íngreme)
INF = 1e9
STEP = 6
cost = np.full((W, H), INF)
back = np.zeros((W, H), dtype=np.int32)
ys = np.arange(H)
def faixa(x):
    return int(lo[x]), int(hi[x])
y0, y1 = faixa(0)
cost[0, y0:y1] = -edge[y0:y1, 0]
for x in range(1, W):
    prev = cost[x - 1]
    best = np.full(H, INF); arg = np.zeros(H, dtype=np.int32)
    for dd in range(-STEP, STEP + 1):
        sh = np.full(H, INF)
        if dd > 0: sh[dd:] = prev[:-dd]
        elif dd < 0: sh[:dd] = prev[-dd:]
        else: sh = prev
        cand = sh + 0.012 * abs(dd)
        m = cand < best
        best[m] = cand[m]; arg[m] = (ys - dd)[m]
    y0, y1 = faixa(x)
    seg = np.full(H, INF); seg[y0:y1] = best[y0:y1] - edge[y0:y1, x]
    cost[x] = seg; back[x] = arg
crest = np.zeros(W)
y = int(np.argmin(cost[W - 1]))
for x in range(W - 1, -1, -1):
    crest[x] = y
    y = back[x, y]

# alfa: até ~40 px abaixo da crista segue a cor (folha opaca; vão de névoa entre as copas transparente, senão a névoa
# vira uma mancha clara por cima do painel ou das letras do rodapé); dali para baixo, copa cheia
d = yy * H - crest[None, :]
ps = blur(p, 0.8)
cheia = smoothstep(30, 48, d)
alfa = np.where(d < -5, 0.0, np.maximum(ps * smoothstep(-5, 0, d), cheia))
alfa = blur(alfa, 0.5)
alfa = np.where(d < -6, 0.0, alfa)

# ---------- tratamento de cor ----------
out = rgb.copy()
lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]

# céu e morros: mais escuro, com o brilho do horizonte contido
ceu = 1 - smoothstep(0.30, 0.56, yy)  # 1 no céu, 0 da névoa para baixo
escurece = 0.56 + 0.16 * smoothstep(0.0, 0.42, yy)  # topo 0.56, horizonte 0.72
out = out * (escurece * ceu + (1 - ceu) * 0.86)[..., None]
# topo do céu um pouco mais azul-grafite
frio = ((1 - smoothstep(0.0, 0.3, yy)) * ceu)[:, 0]
out[..., 0] *= (1 - 0.10 * frio)[:, None]
out[..., 2] *= (1 + 0.06 * frio)[:, None]

# copa: rosa nos realces, vermelho nos meios-tons, sombras marrom-escuras
copa = smoothstep(-2, 8, d)
l = lum[..., None]
luz = smoothstep(0.10, 0.42, lum)[..., None]  # quanto da folha pega luz
alvo_luz = np.array([1.16, 0.86, 1.10])  # realce: o rosa da logo (#df5eb0), mais claro
alvo_meio = np.array([1.10, 0.66, 0.92])  # meio-tom: magenta queimado
alvo_sombra = np.array([0.90, 0.70, 0.86])  # sombra: ameixa quase preta (#3d1c3a)
ganho = alvo_sombra * (1 - luz) + (alvo_meio * (1 - luz) + alvo_luz * luz) * luz
# levanta os meios-tons (mais copas acesas, como no fim de tarde) sem estourar o branco
levanta = np.power(np.clip(out, 0, 1), 0.86) * 1.1
c = np.clip(levanta * ganho, 0, 1)
# mais copas acesas e sombras mais fundas: a luz rosa do fim de tarde pega o alto das copas
luz2 = smoothstep(0.07, 0.36, lum)[..., None]
c = np.clip(c * (0.84 + 0.16 * luz2) * (1 + 0.75 * np.power(luz2, 1.3)), 0, 1)
# o pé da cena cai para quase preto (onde ficam os logos e começa a página preta)
pe = smoothstep(0.80, 1.0, yy)[..., None]
c = c * (1 - 0.55 * pe)
out = out * (1 - copa[..., None]) + c * copa[..., None]
out = np.clip(out, 0, 1)

# ---------- saídas ----------
img = RAIZ / 'public/img'
img.mkdir(parents=True, exist_ok=True)
fundo = Image.fromarray((out * 255).astype(np.uint8))
topo = int(crest.min()) - 4
rgba = np.dstack([out, alfa])[topo:]
copa_img = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA')
for nome, im_, larg in [('hero-fundo', fundo, W), ('hero-copa', copa_img, W)]:
    im_.save(img / f'{nome}.webp', quality=86, method=6)
    pequeno = im_.resize((1100, round(im_.height * 1100 / im_.width)), Image.LANCZOS)
    pequeno.save(img / f'{nome}-1100.webp', quality=84, method=6)
json.dump({'largura': W, 'altura': H, 'topoCopa': topo, 'cristaMin': float(crest.min()), 'cristaMax': float(crest.max())},
          open(RAIZ / 'fonte/camadas.json', 'w'), indent=1)
print(f'crista: {crest.min():.0f}–{crest.max():.0f} px de {H}; copa recortada a partir de y={topo}')

if a.conferir:
    pasta = Path(a.conferir)
    pasta.mkdir(parents=True, exist_ok=True)
    Image.fromarray((alfa * 255).astype(np.uint8)).save(pasta / 'mascara.png')
    mag = np.zeros_like(out); mag[..., 0] = 1; mag[..., 2] = 0.85
    comp = out * alfa[..., None] + mag * (1 - alfa[..., None])
    Image.fromarray((comp * 255).astype(np.uint8)).save(pasta / 'copa-sobre-magenta.png')
    fundo.save(pasta / 'fundo.png')

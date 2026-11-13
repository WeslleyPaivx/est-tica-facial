# Recorta os oito retratos da folha gerada (fonte/avatares.png) em quadrados para os avatares.
# uso: python3 fonte/avatares.py
from pathlib import Path
import numpy as np
from PIL import Image
RAIZ = Path(__file__).resolve().parent.parent
im = Image.open(RAIZ / 'fonte/avatares.png').convert('RGB')
a = np.asarray(im).astype(int)
branco = (a.min(axis=2) > 236)
cols = np.where(branco.mean(axis=0) < 0.6)[0]
rows = np.where(branco.mean(axis=1) < 0.6)[0]
def trechos(idx):
    out = []; ini = idx[0]; ant = idx[0]
    for v in idx[1:]:
        if v != ant + 1:
            out.append((ini, ant)); ini = v
        ant = v
    out.append((ini, ant))
    return [t for t in out if t[1] - t[0] > 100]
cx, cy = trechos(cols), trechos(rows)
print('colunas', cx, 'linhas', cy)
nomes = ['bia', 'rafa', 'lu', 'caio', 'teo', 'nina', 'davi', 'marina']
dest = RAIZ / 'public/img/avatar'
dest.mkdir(parents=True, exist_ok=True)
k = 0
for (y0, y1) in cy:
    for (x0, x1) in cx:
        w = x1 - x0; h = y1 - y0
        lado = min(w, h) - 8
        left = x0 + (w - lado) // 2
        top = y0 + max(0, int((h - lado) * 0.35))
        c = im.crop((left, top, left + lado, top + lado)).resize((192, 192), Image.LANCZOS)
        c.save(dest / f'{nomes[k]}.webp', quality=86, method=6)
        k += 1
print('ok', k)

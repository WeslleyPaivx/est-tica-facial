"""Gera compositions/captions.html e compositions/cta.html a partir de timeline.json.

Tempos por palavra: distribuídos pelo número de letras dentro de cada fala (sem transcrição).
Quando houver o áudio final, rode de novo depois de scripts/build_timeline.py.
"""
import json, re, html

tl = json.load(open("timeline.json"))
KEY = {"cinco", "funcionários", "dinheiro", "humanos?", "equipe", "inteligência", "artificial.", "inteira?", "quero!", "concorrentes!",
       "sites!", "conteúdo!", "clientes!", "tarefas!", "tudo?", "quase", "finalizado!", "bagunça", "acertam", "chefe?", "ia", "decide.", "agentes"}
ORANGE = {"bagunça", "finalizado!", "humanos?", "chefe?"}
MAXW = 3

groups = []
for l in tl["lines"]:
    words = l["text"].split()
    weights = [len(w) + 2 for w in words]
    total, acc, wt = sum(weights), 0, []
    for w, k in zip(words, weights):
        wt.append(l["start"] + (l["end"] - l["start"]) * acc / total); acc += k
    i = 0
    while i < len(words):
        j = min(len(words), i + MAXW)
        # quebra em fim de frase
        for m in range(i, j):
            if re.search(r"[.!?]$", words[m]) and m + 1 < len(words):
                j = m + 1; break
        groups.append({"line": l["id"], "words": words[i:j], "start": wt[i], "end": wt[j] if j < len(words) else l["end"] + 0.12})
        i = j

for a, b in zip(groups, groups[1:]):
    a["end"] = min(a["end"], b["start"])  # um grupo por vez
for g in groups:
    assert g["end"] - g["start"] >= 0.2, g

def word_html(w):
    key = w.lower().strip(",")
    cls = "o" if key in ORANGE else "k" if key in KEY else ""
    return f'<span class="w {cls}">{html.escape(w.upper())}</span>' if cls else f'<span class="w">{html.escape(w.upper())}</span>'

items, tweens = [], []
for n, g in enumerate(groups):
    gid = f"cap{n:02d}"
    s, d = round(g["start"], 3), round(g["end"] - g["start"], 3)
    items.append(f'    <div id="{gid}" class="clip cap" data-start="{s}" data-duration="{d}" data-track-index="0"><div class="cap-in">{" ".join(word_html(w) for w in g["words"])}</div></div>')
    tweens.append(f'      tl.fromTo("#{gid} .cap-in", {{ scale: 0.86, opacity: 0, y: 14 }}, {{ scale: 1, opacity: 1, y: 0, duration: 0.14, ease: "back.out(2.2)" }}, {s});')

captions = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap {{ position: absolute; left: 0; width: 1080px; top: 1120px; height: 220px; display: flex; align-items: flex-start; justify-content: center; overflow: visible; }}
    .cap-in {{ width: 860px; text-align: center; font-family: "Inter", sans-serif; font-weight: 900; font-size: 74px; line-height: 1.08; letter-spacing: -0.01em; color: #ffffff;
      -webkit-text-stroke: 10px rgba(8, 10, 18, 0.92); paint-order: stroke fill; text-shadow: 0 6px 18px rgba(0, 0, 0, 0.55); }}
    .w {{ display: inline-block; }}
    .w.k {{ color: #ffd84d; }}
    .w.o {{ color: #ff9a3d; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(items)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tweens)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
"""
open("compositions/captions.html", "w").write(captions)

l21 = next(l for l in tl["lines"] if l["id"] == "l21")
q, c = round(l21["start"] + 0.05, 2), round(l21["start"] + 1.15, 2)
D = tl["duration"]
cta = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cta {{ position: absolute; left: 0; width: 1080px; display: flex; justify-content: center; overflow: visible; }}
    #cta-q {{ top: 250px; height: 260px; }}
    #cta-c {{ top: 500px; height: 150px; }}
    .q-in {{ width: 880px; text-align: center; font-family: "Inter", sans-serif; font-weight: 900; font-size: 92px; line-height: 1.02; letter-spacing: -0.02em; color: #ffffff;
      -webkit-text-stroke: 12px rgba(8, 10, 18, 0.92); paint-order: stroke fill; text-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); }}
    .c-in {{ padding: 22px 48px; border-radius: 999px; background: #ffd84d; color: #14161c; font-family: "Inter", sans-serif; font-weight: 900; font-size: 66px;
      letter-spacing: -0.01em; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45); white-space: nowrap; }}
  </style>
  <div id="root" data-composition-id="cta" data-width="1080" data-height="1920"
    data-composition-variables='[{{"id":"cta_question","type":"string","label":"CTA pergunta","default":"QUER SUA EQUIPE DE IA?"}},{{"id":"cta_comment","type":"string","label":"CTA comentário","default":"COMENTE: AGENTES"}}]'>
    <div id="cta-q" class="clip cta" data-start="{q}" data-duration="{round(D - q, 2)}" data-track-index="0"><div class="q-in" data-var-text="cta_question">QUER SUA EQUIPE DE IA?</div></div>
    <div id="cta-c" class="clip cta" data-start="{c}" data-duration="{round(D - c, 2)}" data-track-index="1"><div class="c-in" data-var-text="cta_comment">COMENTE: AGENTES</div></div>
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo("#cta-q .q-in", {{ opacity: 0, y: 40, scale: 0.9 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.8)" }}, {q});
      tl.fromTo("#cta-c .c-in", {{ opacity: 0, scale: 0.4 }}, {{ opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.6)" }}, {c});
      tl.fromTo("#cta-c .c-in", {{ rotation: 0 }}, {{ rotation: -3, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }}, {round(c + 0.32, 2)});
      window.__timelines["cta"] = tl;
    }})();
  </script>
</template>
"""
open("compositions/cta.html", "w").write(cta)
print(len(groups), "grupos de legenda; CTA em", q, "e", c)

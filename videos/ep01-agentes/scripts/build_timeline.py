import json, csv
dur = {r[0]: float(r[2]) for r in csv.reader(open("assets/vo/durations.tsv"), delimiter="\t")}
txt = {r[0]: (r[1], r[4]) for r in csv.reader(open("assets/vo/lines.tsv"), delimiter="\t")}
# (start, line id) — starts escolhidos à mão; o fim vem da medição
starts = {"l01":0.30,"l02":2.70,"l03":5.40,"l04":8.00,"l05":8.95,"l06":12.30,"l07":13.70,"l08":14.90,
          "l09":16.30,"l10":18.60,"l11":20.50,"l12":22.25,"l13":24.75,"l14":26.90,
          "l15":28.70,"l16":30.00,"l17":31.75,"l18":33.45,"l19":37.40,"l20":39.55,"l21":42.35}
scenes = [("C1","O caos",0.0,7.9),("C2","A proposta",7.9,16.0),("C3","Os agentes",16.0,28.6),
          ("C4","A reviravolta",28.6,37.2),("C5","A solução",37.2,42.2),("C6","Final",42.2,45.0)]
actions = [(0.0,"Câmera avança rápido até o rosto de Lucas; telefone começa a tocar"),(2.35,"Papéis caem; notificações saltam nos monitores"),
 (5.05,"Nexo surge flutuando atrás de Lucas (efeito mágico)"),(7.75,"Lucas vira a cabeça, assustado"),
 (15.55,"Nexo estala os dedos"),(15.65,"Cinco feixes de luz no escritório; ambiente começa a se organizar"),
 (16.10,"Robô azul aparece (lupa, gráficos holográficos)"),(18.45,"Robô verde aparece (monta página)"),(20.40,"Robô roxo aparece (escreve)"),
 (22.15,"Robô amarelo aparece (organiza mensagens)"),(24.65,"Robô vermelho aparece (empilha documentos)"),(16.0,"Órbita de câmera durante as apresentações"),
 (29.80,"Robô verde levanta o braço comemorando"),(31.35,"Monitor revela site bagunçado, botão gigante fora do lugar (efeito cômico)"),
 (36.40,"Lucas coloca a mão no rosto"),(37.20,"Lucas corrige o projeto no computador"),(39.40,"Lucas aprova (check)"),
 (40.50,"Câmera se afasta revelando a equipe trabalhando"),(42.20,"Nexo olha para a câmera"),(42.40,"Texto: QUER SUA EQUIPE DE IA?"),
 (43.50,"Texto: COMENTE: AGENTES (impacto)"),(44.30,"Nexo pisca para a câmera"),(45.0,"Fim")]
lines=[]
prev_end=0
for lid in sorted(starts):
    s=starts[lid]; e=round(s+dur[lid],2); who,t=txt[lid]
    assert s>=prev_end, f"{lid} sobrepõe a fala anterior"
    prev_end=e
    sc=[c[0] for c in scenes if c[2]<=s<c[3]][0]
    lines.append(dict(id=lid,scene=sc,speaker=who,start=s,end=e,duration=dur[lid],text=t.replace("A í á","A IA"),tts_text=t,audio=f"assets/vo/{lid}.wav"))
assert prev_end<=45.0
json.dump(dict(fps=30,width=1080,height=1920,duration=45.0,scenes=[dict(id=a,name=b,start=c,end=d) for a,b,c,d in scenes],
  lines=lines,actions=[dict(t=a,what=b) for a,b in sorted(actions)]),open("timeline.json","w"),ensure_ascii=False,indent=1)
for l in lines: print(f"{l['id']}\t{l['scene']}\t{l['speaker']}\t{l['start']:.2f}\t{l['end']:.2f}\t{l['duration']:.2f}\t{l['text']}")
# módulo JS para o palco 3D e as legendas (sem fetch em tempo de render)
open("assets/js/timeline-data.js","w").write("// gerado por scripts/build_timeline.py — não editar\nexport default " + json.dumps(json.load(open("timeline.json")), ensure_ascii=False) + ";\n")

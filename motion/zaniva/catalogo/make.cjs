// Gera as imagens quadradas (1080x1080) do catálogo a partir das cenas do filme:
// abre index.html, para a timeline no instante certo e reencaixa a cena num quadrado.
// Uso: node catalogo/make.cjs
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

// box = área do visual dentro da cena original [x, y, largura, altura]
const ITENS = [
  { arq: "01-sites", cena: "s1", t: 8.95, box: [90, 548, 900, 1082], n: "01", titulo: "Sites", desc: "Rápidos, bonitos e feitos pra converter.", itens: ["Landing page", "Site institucional", "Loja virtual"] },
  { arq: "02-automacoes", cena: "s2", t: 13.9, box: [90, 630, 900, 960], n: "02", titulo: "Automações", desc: "Seu processo rodando sozinho, 24h por dia.", itens: ["WhatsApp e e-mail", "Cobranças e lembretes", "Sistemas integrados"] },
  { arq: "03-chatbot", cena: "s3", t: 20.4, box: [170, 660, 740, 1000], n: "03", titulo: "Chatbot<br><em>humanizado</em>", desc: "Conversa como gente. Sem menu robotizado.", itens: ["Atendimento 24h", "Agendamento automático", "Linguagem da sua marca"] },
  { arq: "04-motion", cena: "s4", t: 24.3, box: [170, 640, 740, 860], n: "04", titulo: "Motion<br><em>pra vendas</em>", desc: "Anúncios animados que param o scroll.", itens: ["Anúncios pra loja", "Reels e stories", "Vídeos de oferta"] },
  { arq: "05-design", cena: "s5", t: 28.3, box: [90, 590, 900, 1100], n: "05", titulo: "Design", desc: "Identidade que as pessoas lembram.", itens: ["Logo e identidade", "Posts e artes", "Material impresso"] },
  { arq: "06-crm", cena: "s6", t: 31.4, box: [90, 590, 900, 1110], n: "06", titulo: "CRM", desc: "Cada cliente no lugar certo, do lead à venda.", itens: ["Funil de vendas", "Histórico do cliente", "Relatórios reais"] },
];
const ALVO = [530, 90, 490, 900]; // onde o visual cai no quadrado

const CSS = `
  html, body, #root { height: 1080px !important; }
  #hud, #wipes, .scene, .head, #rb, .tline { display: none !important; }
  .scene.on { display: block !important; height: 1920px; transform-origin: 0 0; }
  #cat { position: absolute; left: 64px; top: 84px; width: 425px; height: 912px; display: flex; flex-direction: column; z-index: 9; }
  #cat .n { font-family: "JB", monospace; font-size: 26px; color: var(--lv); letter-spacing: .08em; }
  #cat h1 { margin-top: 14px; font-size: 76px; font-weight: 700; line-height: 1.04; letter-spacing: -.04em; }
  #cat .r { margin-top: 26px; width: 120px; height: 4px; border-radius: 4px; background: linear-gradient(90deg, var(--mg), var(--pu)); }
  #cat p { margin-top: 24px; font-size: 34px; font-weight: 500; line-height: 1.25; color: rgba(255,255,255,.85); }
  #cat ul { margin-top: 40px; list-style: none; font-size: 31px; font-weight: 600; line-height: 1; }
  #cat li { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-top: 2px solid var(--line); }
  #cat li::before { content: ""; width: 12px; height: 12px; border-radius: 50%; background: var(--mg); flex: none; }
  #cat .b { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
  #cat .b b { font-size: 42px; letter-spacing: -.03em; }
  #cat .b span { white-space: nowrap; padding: 14px 24px; border-radius: 40px; background: #fff; color: #140a26; font-size: 24px; font-weight: 700; }
  #capa { position: absolute; left: 0; right: 0; top: 940px; text-align: center; font-size: 30px; font-weight: 500; color: rgba(255,255,255,.8); z-index: 9; }
`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.goto("file://" + path.resolve(__dirname, "../index.html"));
  await page.addStyleTag({ content: CSS });
  await page.evaluate(() => document.fonts.ready);

  const shot = async (arq, cena, t, transform, html) => {
    await page.evaluate(({ cena, t, transform, html }) => {
      window.__timelines.main.seek(t);
      document.querySelectorAll(".scene").forEach((s) => { s.classList.toggle("on", s.id === cena); s.style.transform = s.id === cena ? transform : ""; });
      document.querySelectorAll("#cat, #capa").forEach((e) => e.remove());
      document.querySelector("#root").insertAdjacentHTML("beforeend", html);
    }, { cena, t, transform, html });
    const out = path.join(__dirname, arq + ".png");
    await page.screenshot({ path: out });
    if (fs.statSync(out).size < 30000) throw new Error(arq + ": imagem vazia?");
    console.log(arq + ".png");
  };

  for (const i of ITENS) {
    const [bx, by, bw, bh] = i.box, [ax, ay, aw, ah] = ALVO;
    const s = Math.min(aw / bw, ah / bh);
    const tx = ax + (aw - bw * s) / 2 - bx * s, ty = ay + (ah - bh * s) / 2 - by * s;
    await shot(i.arq, i.cena, i.t, `translate(${tx}px, ${ty}px) scale(${s})`,
      `<div id="cat"><div class="n">${i.n} / 06</div><h1>${i.titulo}</h1><div class="r"></div><p>${i.desc}</p>
       <ul>${i.itens.map((x) => `<li>${x}</li>`).join("")}</ul><div class="b"><b>zaniva<em>.</em></b><span>Peça um orçamento</span></div></div>`);
  }
  // capa: logo + chamada do fim do filme, centralizados no quadrado
  await shot("00-capa", "s7", 37.4, "translate(0px, -520px)", `<div id="capa">sites · automações · chatbots · motion · design · crm</div>`);
  await browser.close();
})();

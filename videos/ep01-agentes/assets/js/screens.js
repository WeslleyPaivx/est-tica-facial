// Conteúdo 2D das telas e hologramas, desenhado em função do tempo.
import { rr } from "./mat.js";
import { clamp, ease, rng } from "./util.js";

const F = (w, s) => `${w} ${s}px 'Inter Ep', 'Inter', sans-serif`;

function bg(ctx, w, h, col = "#0f1626") { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); }
function txt(ctx, s, x, y, size, col, w = 700, align = "left") { ctx.font = F(w, size); ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); }

const NOTIFS = [
  [0.4, "Cliente: CADÊ MEU PEDIDO?", "#ff5a5a"], [1.1, "Boleto vence HOJE", "#ffb020"], [1.8, "3 chamadas perdidas", "#ff5a5a"],
  [2.4, "Planilha com #ERRO!", "#ffb020"], [2.9, "Reunião em 5 min", "#ff5a5a"], [3.4, "47 e-mails não lidos", "#ffb020"],
  [3.9, "Estoque: ACABOU", "#ff5a5a"], [4.4, "Fornecedor ligando...", "#ffb020"], [5.0, "Imposto atrasado!", "#ff5a5a"],
];

export function drawChaosLeft(ctx, t) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#141a2b");
  txt(ctx, "Caixa de entrada", 28, 46, 26, "#e9edf5");
  ctx.fillStyle = "#ff3b3b"; rr(ctx, 250, 22, 86, 34, 17); ctx.fill();
  txt(ctx, String(Math.min(99, 12 + Math.floor(t * 9))) + (t > 9 ? "+" : ""), 293, 47, 22, "#fff", 700, "center");
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#1b2236" : "#19203a"; ctx.fillRect(20, 70 + i * 52, 600, 48); ctx.fillStyle = "#ff5a5a"; ctx.beginPath(); ctx.arc(42, 94 + i * 52, 7, 0, 7); ctx.fill(); ctx.fillStyle = "#3a4560"; rr(ctx, 62, 84 + i * 52, 260 - i * 18, 12, 6); ctx.fill(); rr(ctx, 62, 102 + i * 52, 380, 8, 4); ctx.fill(); }
  // pop-ups empilhando
  const vis = NOTIFS.filter(([a]) => t >= a);
  vis.slice(-5).forEach(([a, s, col], i, arr) => {
    const k = ease.back(clamp((t - a) / 0.25));
    const y = H - 24 - (arr.length - 1 - i) * 64;
    ctx.save(); ctx.translate(W - 330 + (1 - k) * 340, y - 50);
    ctx.fillStyle = "#ffffff"; rr(ctx, 0, 0, 310, 54, 12); ctx.fill();
    ctx.fillStyle = col; rr(ctx, 0, 0, 10, 54, 5); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(34, 27, 13, 0, 7); ctx.fill();
    txt(ctx, "!", 34, 35, 20, "#fff", 700, "center");
    txt(ctx, s, 58, 34, 19, "#1a1f2e");
    ctx.restore();
  });
}

export function drawChaosRight(ctx, t) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#141a2b");
  txt(ctx, "Agenda — HOJE", 28, 46, 26, "#e9edf5");
  for (let i = 0; i < 7; i++) { ctx.fillStyle = "#26304a"; ctx.fillRect(90, 74 + i * 46, 530, 1); txt(ctx, `${8 + i * 2}h`, 30, 82 + i * 46, 16, "#7d89a6", 400); }
  const r = rng(4);
  for (let i = 0; i < 9; i++) {
    const x = 100 + r() * 360, y = 70 + r() * 260, w = 140 + r() * 80, h = 40 + r() * 50;
    ctx.fillStyle = i % 3 === 0 ? "#ff5a5a" : i % 3 === 1 ? "#ffb020" : "#ff7a1a";
    ctx.globalAlpha = 0.85; rr(ctx, x, y, w, h, 8); ctx.fill(); ctx.globalAlpha = 1;
    txt(ctx, ["URGENTE", "Reunião", "Pagar", "Ligar", "Entregar"][i % 5], x + 10, y + 24, 16, "#fff");
  }
  if (Math.sin(t * 10) > 0) { ctx.fillStyle = "rgba(255,59,59,0.18)"; ctx.fillRect(0, 0, W, H); }
}

export function drawDashboard(ctx, t, variant) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#0d1424");
  txt(ctx, variant ? "Tarefas — equipe IA" : "Painel — concorrentes", 28, 46, 24, "#e9edf5");
  if (!variant) {
    for (let i = 0; i < 8; i++) { const h = 40 + ((i * 37) % 120) + Math.sin(t * 2 + i) * 18; ctx.fillStyle = i % 2 ? "#4fe3ff" : "#2f7bff"; rr(ctx, 40 + i * 70, 340 - h, 44, h, 6); ctx.fill(); }
    ctx.strokeStyle = "#7dffb2"; ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 0; x <= 560; x += 20) ctx.lineTo(40 + x, 150 - Math.sin(x * 0.012 + t) * 40 - x * 0.08);
    ctx.stroke();
  } else {
    const cols = ["A fazer", "Fazendo", "Feito"];
    cols.forEach((c, i) => { txt(ctx, c, 40 + i * 200, 90, 18, "#8b97b3"); });
    for (let j = 0; j < 7; j++) {
      const k = clamp((t * 0.8 + j * 0.37) % 3 / 3);
      const col = Math.min(2, Math.floor(k * 3 + 0.2));
      const colors = ["#ec3d3d", "#f7c21b", "#21b860"];
      ctx.fillStyle = "#1a2440"; rr(ctx, 34 + col * 200, 104 + (j % 4) * 66, 180, 54, 10); ctx.fill();
      ctx.fillStyle = colors[col]; rr(ctx, 34 + col * 200, 104 + (j % 4) * 66, 8, 54, 4); ctx.fill();
      ctx.fillStyle = "#3a4a6e"; rr(ctx, 54 + col * 200, 122 + (j % 4) * 66, 120, 10, 5); ctx.fill();
    }
  }
}

export function drawBuilding(ctx, t, k) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#0d1424");
  txt(ctx, "Gerando site...", 40, 70, 30, "#e9edf5");
  ctx.fillStyle = "#1e2a46"; rr(ctx, 40, 110, 560, 26, 13); ctx.fill();
  ctx.fillStyle = "#21b860"; rr(ctx, 40, 110, Math.max(26, 560 * k), 26, 13); ctx.fill();
  txt(ctx, Math.round(k * 100) + "%", 600, 175, 28, "#7dffb2", 700, "right");
  ctx.font = F(400, 16); ctx.fillStyle = "#5e6b8c";
  for (let i = 0; i < 7; i++) ctx.fillText(`<div class="hero-${i}">${"█".repeat(3 + ((i * 5 + Math.floor(t * 8)) % 9))}</div>`, 40, 220 + i * 24);
}

// Site com bugs: tudo fora do lugar (o botão gigante é um objeto 3D à parte).
export function drawMessy(ctx, t) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#fff8e8");
  ctx.save(); ctx.translate(320, 60); ctx.rotate(-0.12);
  txt(ctx, "BEM VINDO AO SITE SITE", 0, 0, 44, "#ff00aa", 700, "center"); ctx.restore();
  ctx.save(); ctx.translate(90, 200); ctx.rotate(Math.PI); ctx.fillStyle = "#7fd3ff"; rr(ctx, -70, -60, 140, 110, 6); ctx.fill(); txt(ctx, "IMAGEM", 0, 0, 24, "#123", 700, "center"); ctx.restore();
  ctx.fillStyle = "#00e5ff"; ctx.fillRect(200, 120, 420, 34); txt(ctx, "Menu  Menu  Menu  Menu  Menu", 210, 145, 20, "#ffef00");
  ctx.save(); ctx.translate(250, 260); ctx.rotate(0.22); txt(ctx, "Preço: R$ NaN", 0, 0, 36, "#00a000"); ctx.restore();
  txt(ctx, "lorem ipsum lorem ipsum lorem", 160, 330, 26, "#ff6a00");
  txt(ctx, "contato@contato@contato", 330, 380, 22, "#8a2be2");
  ctx.fillStyle = "#ffef00"; ctx.beginPath(); ctx.arc(560 + Math.sin(t * 6) * 6, 230, 34, 0, 7); ctx.fill();
  txt(ctx, "?!", 560 + Math.sin(t * 6) * 6, 242, 32, "#e00", 700, "center");
}

export function drawFixed(ctx, t, fixK, approveK) {
  const W = 640, H = 400;
  bg(ctx, W, H, "#f9f9f9");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, 54); ctx.fillStyle = "#e6e6e4"; ctx.fillRect(0, 54, W, 2);
  ctx.fillStyle = "#ff7a1a"; ctx.beginPath(); ctx.arc(40, 27, 12, 0, 7); ctx.fill();
  txt(ctx, "Lucas & Cia", 62, 35, 20, "#0a0b0c");
  for (const [i, s] of ["Serviços", "Sobre", "Contato"].entries()) txt(ctx, s, 380 + i * 90, 34, 16, "#5c5f63", 400);
  const a = ease.out(fixK);
  ctx.globalAlpha = a;
  txt(ctx, "Sua empresa,", 40, 130 + (1 - a) * 20, 42, "#0a0b0c");
  txt(ctx, "organizada.", 40, 182 + (1 - a) * 20, 42, "#0a0b0c");
  txt(ctx, "Atendimento, conteúdo e tarefas em um só lugar.", 40, 222, 17, "#5c5f63", 400);
  ctx.fillStyle = "#ff7a1a"; rr(ctx, 40, 248, 180 * (0.6 + 0.4 * a), 52, 26); ctx.fill();
  txt(ctx, "Fale conosco", 40 + 90 * (0.6 + 0.4 * a), 282, 18, "#ffffff", 700, "center");
  for (let i = 0; i < 3; i++) { ctx.fillStyle = "#ffffff"; rr(ctx, 410, 90 + i * 100, 200, 84, 10); ctx.fill(); ctx.strokeStyle = "#e3e3e1"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = ["#abcbf9", "#fce88b", "#ffbbfc"][i]; rr(ctx, 426, 106 + i * 100, 40, 40, 8); ctx.fill(); ctx.fillStyle = "#d6d6d4"; rr(ctx, 480, 112 + i * 100, 110, 10, 5); ctx.fill(); rr(ctx, 480, 132 + i * 100, 80, 8, 4); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (approveK > 0) {
    const k = ease.back(clamp(approveK));
    ctx.save(); ctx.translate(320, 200); ctx.scale(k, k); ctx.rotate(-0.12);
    ctx.fillStyle = "rgba(33,184,96,0.95)"; rr(ctx, -150, -46, 300, 92, 46); ctx.fill();
    txt(ctx, "✓ APROVADO", 0, 14, 40, "#ffffff", 700, "center");
    ctx.restore();
  }
}

// Hologramas (fundo transparente, desenhados com blend aditivo)
export function drawHolo(ctx, kind, t, k) {
  const W = 384, H = 288;
  ctx.clearRect(0, 0, W, H);
  const col = { blue: "#7fc0ff", green: "#7dffb2", purple: "#c9a6ff", yellow: "#ffe08a", red: "#ff9a9a" }[kind];
  ctx.globalAlpha = 0.18; ctx.fillStyle = col; rr(ctx, 4, 4, W - 8, H - 8, 18); ctx.fill();
  ctx.globalAlpha = 0.9; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = col; ctx.strokeStyle = col;
  if (kind === "blue") {
    txt(ctx, "CONCORRENTES", 24, 40, 22, col);
    for (let i = 0; i < 6; i++) { const h = (30 + ((i * 41) % 120)) * clamp(k * 1.6 - i * 0.12); rr(ctx, 30 + i * 56, 250 - h, 36, Math.max(1, h), 5); ctx.fill(); }
    ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x <= 320 * clamp(k * 1.3); x += 10) ctx.lineTo(30 + x, 120 - Math.sin(x * 0.03) * 30 + x * 0.05); ctx.stroke();
  } else if (kind === "green") {
    txt(ctx, "SITE", 24, 40, 22, col);
    const blocks = [[24, 60, 336, 34], [24, 104, 200, 90], [236, 104, 124, 40], [236, 154, 124, 40], [24, 204, 336, 60]];
    blocks.forEach(([x, y, w, h], i) => { const a = clamp(k * 5 - i); ctx.globalAlpha = 0.3 + 0.6 * a; ctx.save(); ctx.translate(0, (1 - a) * -30); rr(ctx, x, y, w, h, 6); ctx.fill(); ctx.restore(); });
  } else if (kind === "purple") {
    txt(ctx, "POST #1", 24, 40, 22, col);
    const n = Math.floor(clamp(k) * 30);
    for (let i = 0; i < 7; i++) { const w = Math.min(320, Math.max(0, n * 14 - i * 40)); if (w > 0) { rr(ctx, 24, 64 + i * 30, w * (0.7 + ((i * 13) % 30) / 100), 12, 6); ctx.fill(); } }
  } else if (kind === "yellow") {
    txt(ctx, "MENSAGENS", 24, 40, 22, col);
    for (let i = 0; i < 5; i++) { const a = clamp(k * 6 - i); if (a <= 0) continue; ctx.globalAlpha = 0.9 * a; const right = i % 2; rr(ctx, right ? 150 : 24, 60 + i * 44, 200, 34, 17); ctx.fill(); }
  } else if (kind === "red") {
    txt(ctx, "TAREFAS", 24, 40, 22, col);
    for (let i = 0; i < 6; i++) { const done = clamp(k * 7 - i) > 0.5; ctx.lineWidth = 3; ctx.strokeRect(28, 60 + i * 36, 22, 22); if (done) { ctx.beginPath(); ctx.moveTo(31, 72 + i * 36); ctx.lineTo(38, 79 + i * 36); ctx.lineTo(48, 63 + i * 36); ctx.stroke(); } rr(ctx, 64, 66 + i * 36, 220 - ((i * 37) % 90), 10, 5); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

// Badge 3D de notificação ("!") para os sprites que saltam dos monitores.
export function drawBadge(ctx, label, col) {
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(64, 64, 54, 0, 7); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.stroke();
  txt(ctx, label, 64, 84, 58, "#fff", 700, "center");
}

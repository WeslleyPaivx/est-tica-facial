// Gera a capa vertical (1080x1920) com o mesmo palco 3D do episódio.
// Uso: node scripts/capa.mjs   (serve o projeto localmente e fotografa com o Chromium do Playwright)
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/index.html`);
await page.waitForFunction(() => window.__ep01Debug, null, { timeout: 180000 });

await page.evaluate(() => {
  const cam = { pos: [0.0, 1.62, -2.35], target: [0, 1.3, 0.3], fov: 46 };
  const spots = { blue: [-0.6, 0.98, 1.05], green: [-0.36, 1.3, 1.4], purple: [0, 1.48, 1.75], yellow: [0.36, 1.3, 1.4], red: [0.6, 0.98, 1.05] };
  window.__ep01Debug.render(27.5, (s) => {
    s.cam = cam;
    s.chairYaw = Math.PI;
    s.ring = false; s.button = 0; s.magic = 0; s.snap = 0; s.tech = 1;
    s.nexo.visible = false;
    s.lucas.pose = { ...s.lucas.pose, lean: -0.08, torsoYaw: 0, headYaw: 0, headPitch: -0.06, headRoll: 0.06, bounce: 0.02, lShX: 1.55, lShZ: 0.8, lShY: 0, lElb: 1.7, rShX: 1.55, rShZ: 0.8, rShY: 0, rElb: 1.7, knee: 0 };
    s.lucas.face = { brow: 1, browIn: 0.65, lid: 0, wide: 1.28, pupil: 0.55, smile: -0.5, open: 0.5, mouthW: 1.1, lookX: 0, lookY: 0.2 };
    s.lucas.blink = 0; s.lucas.talk = 0;
    for (const [k, p] of Object.entries(spots)) {
      const a = s.agents[k];
      a.pos = p; a.scale = 1; a.visible = true; a.holo = 0;
      a.yaw = Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]);
      a.st = { ...a.st, hop: 0, squash: 0, lean: 0, tilt: p[0] * 0.15, lx: 0.3, lz: 0.4, rx: k === "green" || k === "red" ? 2.6 : 0.3, rz: 0.5 };
      a.face = { ...a.face, blink: 0, happy: 1, worried: 0, talk: 0, smile: 1 };
    }
    for (const k in s.beams) s.beams[k] = 0;
  });
  // título da capa (Inter Ep já declarada no index.html)
  const t = document.createElement("div");
  t.innerHTML = `<div style="font:700 104px/1.0 'Inter Ep',sans-serif;letter-spacing:-0.03em;color:#fff;-webkit-text-stroke:14px rgba(8,10,18,.95);paint-order:stroke fill;text-shadow:0 10px 28px rgba(0,0,0,.55)">CONTRATEI 5<br>FUNCIONÁRIOS</div>
    <div style="display:inline-block;margin-top:26px;padding:18px 40px;border-radius:999px;background:#ffd84d;color:#14161c;font:700 70px/1 'Inter Ep',sans-serif;letter-spacing:-0.02em;box-shadow:0 10px 30px rgba(0,0,0,.45)">NENHUM É HUMANO!</div>`;
  Object.assign(t.style, { position: "absolute", left: "0", top: "200px", width: "1080px", textAlign: "center", zIndex: "10" });
  document.getElementById("root").appendChild(t);
  for (const id of ["captions", "cta"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
});
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.join(root, "entrega"), { recursive: true });
await page.screenshot({ path: path.join(root, "entrega/capa-tiktok.png") });
await page.screenshot({ path: path.join(root, "entrega/capa-tiktok.jpg"), type: "jpeg", quality: 92 });
await browser.close();
server.close();
console.log("capa salva em entrega/capa-tiktok.png e .jpg");

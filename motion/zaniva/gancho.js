// Gancho de 3,6 s pro Reels: mensagens chegando de madrugada sem resposta + a pergunta.
// É colado na frente do filme por `npm run reels`.
const tl = gsap.timeline({ paused: true });
const cues = (window.__cues = []);
const sfx = (k, t, p) => cues.push([k, t, p || 0]);

tl.fromTo("#bg .b1", { x: 0, opacity: 0.3 }, { x: 200, opacity: 0.6, duration: 3.6, ease: "sine.inOut" }, 0);
tl.fromTo("#bg .b2", { x: 0, opacity: 0.5 }, { x: -220, opacity: 0.9, duration: 3.6, ease: "sine.inOut" }, 0);
tl.fromTo("#bg .b4", { x: 0, opacity: 0.2 }, { x: -300, opacity: 0.6, duration: 3.6, ease: "sine.inOut" }, 0);

tl.fromTo(".clock", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
document.querySelectorAll(".nt").forEach((n, i) => {
  const at = 0.08 + i * 0.3;
  tl.fromTo(n, { y: -260, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, at);
  sfx("ding", at + 0.1);
  tl.to(n, { opacity: 0.45, duration: 0.4 }, 1.25); // ficam sem resposta
});
document.querySelectorAll(".q .ln").forEach((ln, i) => {
  const cs = [...ln.textContent].map((c) => { const s = document.createElement("span"); s.className = "ch"; s.textContent = c === " " ? " " : c; return s; });
  ln.replaceChildren(...cs);
  tl.fromTo(cs, { yPercent: 115, rotation: 7 }, { yPercent: 0, rotation: 0, duration: 0.6, ease: "expo.out", stagger: 0.02 }, 1.0 + i * 0.14);
});
sfx("slam", 1.05);
sfx("shimmer", 1.3);
tl.fromTo(".q .mg", { scale: 1 }, { scale: 1.06, transformOrigin: "0 50%", duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.1);
sfx("riser", 2.85);
tl.to("#g", { scale: 1.12, opacity: 0, duration: 0.3, ease: "power3.in" }, 3.3);

window.__timelines = window.__timelines || {};
window.__timelines["gancho"] = tl;
tl.seek(0);

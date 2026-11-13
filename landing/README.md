# Zaniva — landing page

Site estático (Vite, HTML/CSS/JS puros), separado do app Next.js do CRM na raiz. Base: template "Trami", rebatizado
para a Zaniva (logo, nomes e paleta).

```bash
npm ci
npm run dev     # http://localhost:5193
npm run build   # gera dist/
```

- Seções em `src/sections/<nome>.html|.css`, movimento em `src/motion/`, tokens em `src/styles/tokens.css`.
- Logo: `<symbol id="i-t">` em `src/sections/icones.html` (Z de fluxo, três nós) e `public/favicon.svg`.
- Paisagem: `python3 fonte/camadas.py` regera `public/img/hero-*.webp` (cores da copa no bloco `alvo_*`).

Ainda da demo (não publicar como fato da Zaniva): textos de "automação sem código", nota 4,9/1.200 avaliações,
"Mais de 3.000 empresas", logos de clientes, depoimentos e números, rostos gerados, preços. Contato está `[preencher]`.

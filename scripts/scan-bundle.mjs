#!/usr/bin/env node
// Depois do `next build`: varre tudo que o navegador baixa (.next/static) atrás de segredos.
// 1. padrões de chaves conhecidas (os mesmos do scan-secrets); um JWT só passa se for a chave pública "anon";
// 2. o VALOR de toda variável de ambiente do servidor (sem NEXT_PUBLIC_) presente no build não pode aparecer no bundle.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PATTERNS } from "./scan-secrets.mjs";

const DIR = ".next/static";
// variáveis do sistema/CI que não são segredo e podem coincidir com texto comum
const IGNORE_ENV = /^(PATH|HOME|PWD|OLDPWD|SHELL|USER|LOGNAME|LANG|LC_|TERM|TMPDIR|HOSTNAME|NODE_|npm_|PNPM_|CI$|GITHUB_(?!TOKEN)|RUNNER_|SHLVL|_$)/;

export function jwtRole(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).role ?? null;
  } catch {
    return null;
  }
}

export function findLeaks(text, secretValues) {
  const found = [];
  for (const [name, re] of PATTERNS) {
    const g = new RegExp(re.source, "g");
    for (const m of text.matchAll(g)) {
      if (name.startsWith("JWT") && jwtRole(m[0]) === "anon") continue; // chave pública legada, protegida por RLS
      found.push(name);
    }
  }
  for (const [name, value] of secretValues) if (text.includes(value)) found.push(`valor de ${name}`);
  return [...new Set(found)];
}

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

function main() {
  const secretValues = Object.entries(process.env).filter(
    ([k, v]) => !k.startsWith("NEXT_PUBLIC_") && !IGNORE_ENV.test(k) && typeof v === "string" && v.length >= 16,
  );
  let list;
  try {
    list = files(DIR);
  } catch {
    console.error(`scan-bundle: ${DIR} não existe. Rode "pnpm build" antes.`);
    process.exit(2);
  }
  const findings = [];
  for (const f of list) for (const leak of findLeaks(readFileSync(f, "utf8"), secretValues)) findings.push(`${f}: ${leak}`);
  if (findings.length) {
    console.error("Segredo no código enviado ao navegador (valores não exibidos). Remova e ROTACIONE:\n" + findings.join("\n"));
    process.exit(1);
  }
  console.log(`scan-bundle: ${list.length} arquivos do navegador sem segredos (${secretValues.length} variáveis de servidor conferidas).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

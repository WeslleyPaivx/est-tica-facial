#!/usr/bin/env node
// Varredura de segredos em arquivos versionados e, com --history, em todo o histórico Git.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const PATTERNS = [
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{20,}/],
  ["JWT (possível service_role)", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["OpenAI key", /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ["Anthropic key", /sk-ant-[A-Za-z0-9_-]{20,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{36,}/],
  ["Stripe/Asaas live key", /(?:sk_live_|\$aact_)[A-Za-z0-9_$-]{20,}/],
  ["Chave privada", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["URL Postgres com senha", /postgres(?:ql)?:\/\/[^:\s/]+:(?!postgres@)[^@\s]{6,}@(?!localhost|127\.0\.0\.1)/],
  ["Secret em NEXT_PUBLIC", /NEXT_PUBLIC_[A-Z_]*(?:SECRET|SERVICE_ROLE|PRIVATE)[A-Z_]*\s*=/],
];

const ALLOW = [/^pnpm-lock\.yaml$/, /^scripts\/scan-secrets\.mjs$/, /^tests\/security\//];

export function scanText(text) {
  return PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

function main() {
  const history = process.argv.includes("--history");
  const findings = [];
  const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" }).split("\n").filter(Boolean);
  for (const f of files) {
    if (ALLOW.some((re) => re.test(f))) continue;
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    for (const name of scanText(text)) findings.push(`${f}: ${name}`);
  }
  if (history) {
    const log = execFileSync("git", ["log", "-p", "--all", "--no-color", "--", ".", ":!pnpm-lock.yaml", ":!scripts/scan-secrets.mjs", ":!tests/security"], {
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
    for (const name of scanText(log)) findings.push(`histórico git: ${name}`);
  }
  if (findings.length) {
    console.error("Possíveis segredos encontrados (não exibidos). Remova e ROTACIONE as chaves:\n" + findings.join("\n"));
    process.exit(1);
  }
  console.log(`scan-secrets: nenhum segredo encontrado em ${files.length} arquivos${history ? " e no histórico" : ""}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

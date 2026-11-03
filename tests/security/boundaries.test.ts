import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
// @ts-expect-error módulo JS sem tipos
import { scanText } from "../../scripts/scan-secrets.mjs";

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => /\.(ts|tsx|mjs|js)$/.test(f) && !f.startsWith("tests/") && !f.startsWith("node_modules/"));
const src = (f: string) => readFileSync(f, "utf8");

describe("fronteira frontend/backend", () => {
  it("nenhum código referencia service_role/secret key", () => {
    const offenders = files.filter((f) => !["lib/env.ts", "scripts/scan-secrets.mjs"].includes(f) && /SERVICE_ROLE|sb_secret_|SUPABASE_SECRET/i.test(src(f)));
    expect(offenders).toEqual([]);
  });

  it("componentes cliente não importam módulos server-only nem o cliente Supabase de servidor", () => {
    const clientFiles = files.filter((f) => /^\s*["']use client["']/.test(src(f)));
    expect(clientFiles.length).toBeGreaterThan(0);
    const offenders = clientFiles.filter((f) => /@\/(server\/session|lib\/supabase\/server)|["']server-only["']/.test(src(f)));
    expect(offenders).toEqual([]);
  });

  it("módulos com sessão/Supabase de servidor são server-only", () => {
    for (const f of ["lib/supabase/server.ts", "server/session.ts"]) expect(src(f)).toMatch(/import "server-only"/);
  });

  it("server actions começam com 'use server'", () => {
    for (const f of files.filter((f) => f.startsWith("server/actions/"))) expect(src(f).trimStart()).toMatch(/^"use server"/);
  });

  it("todas as server actions de organização revalidam a sessão", () => {
    const s = src("server/actions/organizations.ts");
    const exported = [...s.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{\n\s+const s = await (authed|authedOrg)\(\)/g)];
    const all = [...s.matchAll(/export async function (\w+)/g)];
    expect(exported.length).toBe(all.length);
  });

  it("nenhuma variável NEXT_PUBLIC_ sensível", () => {
    const offenders = files.filter((f) => /NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE|PRIVATE|TOKEN|PASSWORD)/.test(src(f)));
    expect(offenders).toEqual([]);
  });

  it("dados de tenant nunca usam cache compartilhado", () => {
    const offenders = files.filter((f) => /unstable_cache|["']use cache["']/.test(src(f)));
    expect(offenders).toEqual([]);
  });
});

describe("gitignore", () => {
  const gi = readFileSync(".gitignore", "utf8");
  it.each([".env", ".env.*", "!.env.example", ".vercel", "*.dump", "*.pem"])("contém %s", (rule) => {
    expect(gi.split("\n")).toContain(rule);
  });
  it(".env.example não contém valores reais", () => {
    const vals = readFileSync(".env.example", "utf8")
      .split("\n")
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => l.split("=")[1]);
    expect(vals.every((v) => v === "" || v === "http://localhost:3000")).toBe(true);
  });
});

describe("detector de segredos", () => {
  it("detecta padrões conhecidos", () => {
    expect(scanText("key=sb_secret_" + "a".repeat(30))).toContain("Supabase secret key");
    expect(scanText("-----BEGIN PRIVATE KEY-----")).toContain("Chave privada");
    expect(scanText("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=x")).toContain("Secret em NEXT_PUBLIC");
  });
  it("não acusa texto comum", () => expect(scanText("const x = 1; // publishable key")).toEqual([]));
});

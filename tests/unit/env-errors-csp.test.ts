import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";
import { safeDbMessage } from "@/lib/security/errors";
import { buildCsp } from "@/lib/security/csp";

const ok = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abcdefghijklmnopqrstuvwxyz",
  NEXT_PUBLIC_SITE_URL: "https://app.zaniva.test",
};

describe("env pública", () => {
  it("aceita configuração válida", () => expect(parsePublicEnv(ok).NEXT_PUBLIC_SITE_URL).toBe(ok.NEXT_PUBLIC_SITE_URL));
  it("falha sem variáveis, sem expor valores", () => {
    expect(() => parsePublicEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
  it("recusa secret key no lugar da publishable", () => {
    expect(() => parsePublicEnv({ ...ok, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_" + "secret_" + "abcdefghijklmnopqrstuvwxyz" })).toThrow(/rotacione/);
  });
});

describe("erros seguros", () => {
  it("não repassa mensagem interna desconhecida", () => {
    expect(safeDbMessage({ code: "XX000", message: "relation private.x at line 3" })).toBe("Não foi possível concluir a operação.");
  });
  it("mapeia RLS/permissão", () => expect(safeDbMessage({ code: "42501", message: "permission denied" })).toMatch(/permissão/));
  it("mapeia regra de último owner", () =>
    expect(safeDbMessage({ code: "P0001", message: "organization must keep at least one owner" })).toMatch(/proprietário/));
  it("mapeia limite de escrita por minuto", () =>
    expect(safeDbMessage({ code: "P0001", message: "too many requests" })).toMatch(/Aguarde um minuto/));
  it("explica duplicado de contato e de empresa sem expor o nome do índice", () => {
    const contato = safeDbMessage({ code: "23505", message: 'duplicate key value violates unique constraint "contacts_org_email_uniq"' });
    const empresa = safeDbMessage({ code: "23505", message: 'duplicate key value violates unique constraint "companies_org_name_uniq"' });
    expect(contato).toBe("Já existe um contato com este e-mail.");
    expect(empresa).toBe("Já existe uma empresa com este nome.");
    expect(contato + empresa).not.toMatch(/uniq|constraint/);
  });
});

describe("CSP", () => {
  it("produção: nonce, sem unsafe-eval, sem frames", () => {
    const csp = buildCsp("abc", { dev: false, supabaseUrl: ok.NEXT_PUBLIC_SUPABASE_URL });
    expect(csp).toContain("'nonce-abc'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });
});

import { describe, expect, it } from "vitest";
import { createOrgSchema, inviteSchema, slugify } from "@/features/organizations/schemas";
import { signUpSchema, totpSchema } from "@/features/auth/schemas";

describe("schemas de organização", () => {
  it("slugify normaliza acentos e símbolos", () => {
    expect(slugify("Clínica Odonto São José!")).toBe("clinica-odonto-sao-jose");
    expect(slugify("../../etc/passwd")).toBe("etc-passwd");
  });
  it("rejeita slug inválido", () => {
    expect(createOrgSchema.safeParse({ name: "Alpha", slug: "../evil" }).success).toBe(false);
    expect(createOrgSchema.safeParse({ name: "Alpha", slug: "ab" }).success).toBe(false);
    expect(createOrgSchema.safeParse({ name: "Alpha", slug: "alpha-imoveis" }).success).toBe(true);
  });
  it("convite nunca concede owner e normaliza e-mail", () => {
    expect(inviteSchema.safeParse({ email: "a@b.co", role: "owner" }).success).toBe(false);
    expect(inviteSchema.safeParse({ email: "a@b.co", role: "root" }).success).toBe(false);
    expect(inviteSchema.parse({ email: "  Pessoa@Empresa.COM ", role: "member" }).email).toBe("pessoa@empresa.com");
  });
});

describe("schemas de auth", () => {
  it("exige senha forte", () => {
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "curta1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "somenteletrasaqui" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "Curta!1" }).success).toBe(false); // 7 caracteres
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "semmaiuscula!" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "SemSimbolo1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Ana", email: "a@b.co", password: "Senha#forte" }).success).toBe(true);
  });
  it("TOTP exige 6 dígitos e factorId UUID", () => {
    expect(totpSchema.safeParse({ factorId: "x", code: "123456" }).success).toBe(false);
    expect(totpSchema.safeParse({ factorId: "6b0f8f8e-1c1a-4c1e-9f1a-1a2b3c4d5e6f", code: "12345a" }).success).toBe(false);
    expect(totpSchema.safeParse({ factorId: "6b0f8f8e-1c1a-4c1e-9f1a-1a2b3c4d5e6f", code: "123456" }).success).toBe(true);
  });
});

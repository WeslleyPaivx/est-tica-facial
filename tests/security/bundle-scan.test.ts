import { describe, expect, it } from "vitest";
// @ts-expect-error módulo JS sem tipos
import { findLeaks } from "../../scripts/scan-bundle.mjs";

// tokens montados em tempo de execução: nenhum segredo de verdade fica escrito no repositório
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (role: string) => `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role, iss: "supabase", iat: 1700000000 })}.${"x".repeat(43)}`;

describe("varredura do bundle do navegador", () => {
  it("aceita a chave pública anon", () => expect(findLeaks(`const k="${jwt("anon")}"`, [])).toEqual([]));
  it("acusa um JWT service_role", () => expect(findLeaks(`const k="${jwt("service_role")}"`, [])).toEqual(["JWT (possível service_role)"]));
  it("acusa secret key do Supabase", () => expect(findLeaks(`k="sb_secret_${"a".repeat(30)}"`, [])).toEqual(["Supabase secret key"]));
  it("acusa o valor de qualquer variável de servidor", () => {
    const valor = "valor-interno-" + "z".repeat(20);
    expect(findLeaks(`fetch("/x?t=${valor}")`, [["MINHA_CHAVE", valor]])).toEqual(["valor de MINHA_CHAVE"]);
    expect(findLeaks(`fetch("/x")`, [["MINHA_CHAVE", valor]])).toEqual([]);
  });
});

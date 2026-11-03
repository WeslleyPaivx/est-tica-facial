import { expect, test } from "@playwright/test";

test("rotas protegidas redirecionam anônimo para login com next seguro", async ({ page }) => {
  await page.goto("/settings/members");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings%2Fmembers$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.locator('input[name="next"]')).toHaveValue("/settings/members");
});

test("raiz redireciona para login sem parâmetro", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("open redirect em next é neutralizado", async ({ page }) => {
  await page.goto("/login?next=//evil.test/phish");
  await expect(page.locator('input[name="next"]')).toHaveValue("");
  await page.goto("/login?next=https://evil.test");
  await expect(page.locator('input[name="next"]')).toHaveValue("");
});

test("cabeçalhos de segurança e CSP com nonce", async ({ request }) => {
  const res = await request.get("/login");
  const h = res.headers();
  expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["cache-control"]).toContain("no-store");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("HTML não expõe segredos nem chaves privadas", async ({ request }) => {
  const html = await (await request.get("/login")).text();
  expect(html).not.toMatch(/sb_secret_|service_role|SUPABASE_SECRET/i);
});

test("login com falha mostra erro genérico (sem enumeração)", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ninguem@exemplo.test");
  await page.getByLabel("Senha").fill("qualquer-senha-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("E-mail ou senha inválidos");
});

test("cadastro valida senha fraca no servidor", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Nome").fill("Pessoa Teste");
  await page.getByLabel("E-mail profissional").fill("pessoa@exemplo.test");
  await page.getByLabel("Senha").fill("curta");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("12 caracteres");
});

test("link de confirmação inválido leva à página de erro", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=invalido&type=signup&next=https://evil.test");
  await expect(page).toHaveURL(/\/auth\/error$/);
});

test("tema escuro aplicado via preferência salva", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "zaniva_theme", value: "dark", url: baseURL! }]);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(20, 23, 25)");
});

test("layout sem rolagem horizontal", async ({ page }) => {
  for (const path of ["/login", "/signup", "/forgot-password"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, path).toBe(false);
  }
});

import { z } from "zod";

// Apenas variáveis públicas por design (NEXT_PUBLIC_*). Nada secreto pode entrar aqui.
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type PublicEnv = z.infer<typeof schema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Variáveis de ambiente públicas inválidas ou ausentes: ${keys}. Veja .env.example.`);
  }
  if (/^sb_secret_|service_role/i.test(parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("Chave secreta configurada como pública. Use a publishable key e rotacione a secret key.");
  }
  return parsed.data;
}

export function publicEnv(): PublicEnv {
  // acesso literal para o Next inlinear as variáveis públicas
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

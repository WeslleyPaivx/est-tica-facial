import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254).pipe(z.email({ message: "E-mail inválido." }));
const password = z
  .string()
  .min(8, "Use ao menos 8 caracteres.")
  .max(128, "Senha longa demais.")
  .refine((v) => /[A-Z]/.test(v), "Inclua ao menos uma letra maiúscula.")
  .refine((v) => /[^A-Za-z0-9\s]/.test(v), "Inclua ao menos um símbolo (ex.: ! @ # $).");

export const signInSchema = z.object({ email, password: z.string().min(1, "Informe a senha.").max(128) });
export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome.").max(120),
  email,
  password,
});
export const emailSchema = z.object({ email });
export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "As senhas não conferem.", path: ["confirm"] });
export const totpSchema = z.object({
  factorId: z.uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Código de 6 dígitos."),
});

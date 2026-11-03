import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1.5 text-2xl">Recuperar senha</h1>
      <p className="mb-7 text-sm text-muted">Enviaremos um link de redefinição para o e-mail cadastrado.</p>
      <ForgotPasswordForm />
    </>
  );
}

import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Recuperar senha</h1>
      <p className="mb-5 text-[13px] text-muted">Enviaremos um link de redefinição para o e-mail cadastrado.</p>
      <ForgotPasswordForm />
    </>
  );
}

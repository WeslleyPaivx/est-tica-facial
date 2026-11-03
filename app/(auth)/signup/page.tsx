import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Criar conta</h1>
      <p className="mb-5 text-[13px] text-muted">Confirme o e-mail para criar ou entrar em uma organização.</p>
      <SignUpForm />
    </>
  );
}

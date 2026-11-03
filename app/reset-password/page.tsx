import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/auth-forms";
import { requireSession } from "@/server/session";
import AuthLayout from "../(auth)/layout";

export const metadata: Metadata = { title: "Nova senha" };

export default async function ResetPasswordPage() {
  await requireSession();
  return (
    <AuthLayout>
      <h1 className="mb-1.5 text-2xl">Definir nova senha</h1>
      <p className="mb-7 text-sm text-muted">As demais sessões serão encerradas.</p>
      <NewPasswordForm />
    </AuthLayout>
  );
}

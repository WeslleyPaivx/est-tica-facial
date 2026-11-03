import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/auth-forms";
import { requireSession } from "@/server/session";
import AuthLayout from "../(auth)/layout";

export const metadata: Metadata = { title: "Nova senha" };

export default async function ResetPasswordPage() {
  await requireSession();
  return (
    <AuthLayout>
      <h1 className="mb-1 text-base font-semibold">Definir nova senha</h1>
      <p className="mb-5 text-[13px] text-muted">As demais sessões serão encerradas.</p>
      <NewPasswordForm />
    </AuthLayout>
  );
}

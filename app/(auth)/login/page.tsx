import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/auth-forms";
import { safeNextPath } from "@/lib/security/redirect";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Entrar</h1>
      <p className="mb-5 text-[13px] text-muted">Acesse a conta da sua organização.</p>
      <SignInForm next={safeNextPath(next, "")} />
    </>
  );
}

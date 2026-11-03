import Link from "next/link";
import AuthLayout from "../../(auth)/layout";

export default function AuthErrorPage() {
  return (
    <AuthLayout>
      <h1 className="mb-1.5 text-2xl">Link inválido ou expirado</h1>
      <p className="mb-7 text-sm text-muted">Solicite um novo link e tente novamente no mesmo navegador.</p>
      <Link href="/login" className="text-sm text-fg underline-offset-2 hover:underline">Voltar para o login</Link>
    </AuthLayout>
  );
}

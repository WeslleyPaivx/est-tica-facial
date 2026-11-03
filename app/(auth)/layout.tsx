import { Logo } from "@/design-system/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Fundo atmosférico desfocado: o único gradiente do sistema, restrito às telas de entrada. */}
      <div aria-hidden className="z-auth-wash pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-lg border border-border bg-surface p-8">{children}</div>
      </div>
    </main>
  );
}

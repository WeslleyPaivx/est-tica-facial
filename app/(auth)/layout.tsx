export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex items-center gap-2">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-[13px] font-semibold text-accent-fg">Z</span>
          <span className="text-sm font-semibold tracking-tight">Zaniva CRM</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">{children}</div>
      </div>
    </main>
  );
}

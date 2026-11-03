export function buildCsp(nonce: string, opts: { dev: boolean; supabaseUrl?: string }): string {
  const connect = ["'self'", opts.supabaseUrl].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${opts.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connect}${opts.dev ? " ws:" : ""}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    ...(opts.dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

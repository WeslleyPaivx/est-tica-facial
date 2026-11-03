import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { GlassFilterDefs } from "@/design-system/components/glass";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Zaniva CRM", template: "%s · Zaniva" },
  description: "CRM multiempresa Zaniva.",
  robots: { index: false, follow: false },
};

// Peso único (400): hierarquia só por tamanho.
const inter = Inter({ subsets: ["latin"], weight: ["400"], variable: "--font-inter", display: "swap" });

const THEMES = ["light", "dark", "system"] as const;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pref = (await cookies()).get("zaniva_theme")?.value;
  const theme = THEMES.find((t) => t === pref) ?? "system";
  return (
    <html lang="pt-BR" data-theme={theme} className={inter.variable}>
      <body>
        <GlassFilterDefs />
        {children}
      </body>
    </html>
  );
}

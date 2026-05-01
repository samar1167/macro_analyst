import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Macro Intelligence Platform",
  description: "Interactive macro reasoning and scenario analysis workbench.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "/";

  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <Providers>
          <AppShell pathname={pathname}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}


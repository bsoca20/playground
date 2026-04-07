import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cefalix Launch Simulator",
  description: "Premium educational launch simulator for pharma business cases."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
        <footer className="border-t border-white/10 bg-black px-6 py-4 text-center text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          All rights reserved · Private and Confidential · Do not distribute · Proprietary of Bluebarna Ecosystems SL - Spain
        </footer>
      </body>
    </html>
  );
}

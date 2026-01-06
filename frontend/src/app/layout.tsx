import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Value AI",
  description: "Plataforma interna da Value para geração de conteúdo de produtos",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="app-root">{children}</body>
    </html>
  );
}

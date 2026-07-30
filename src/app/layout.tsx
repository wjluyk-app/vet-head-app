import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cubby Cup App",
  description: "Private Cubby Cup tournament management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="appHeader">
          <div className="brand">CUBBY CUP</div>
          <div className="edition">2026 · VERSION 5</div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

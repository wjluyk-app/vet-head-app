import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cubby Cup 2026",
  description: "Private Cubby Cup tournament hub",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="appHeader">
          <Link className="brandLink" href="/">
            <div className="brand">CUBBY CUP</div>
            <div className="edition">2026 · TOURNAMENT HUB</div>
          </Link>
          <nav className="headerNav">
            <Link href="/scoreboard">Scoreboard</Link>
            <Link href="/friday">Friday</Link>
            <Link href="/schedule">Schedule</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

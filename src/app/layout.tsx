import type { Metadata } from "next";
import Link from "next/link";
import { getBillAdminUser } from "@/lib/auth/admin";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cubby Cup 2026",
  description: "Private Cubby Cup tournament hub",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adminUser = await getBillAdminUser();

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
            <Link href="/schedule">Schedule</Link>
            {adminUser ? (
              <>
                <Link href="/admin">Admin</Link>
                <Link href="/login">Account</Link>
              </>
            ) : (
              <Link href="/login">Sign In</Link>
            )}
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

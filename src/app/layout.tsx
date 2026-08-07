import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBillAdminUser } from "@/lib/auth/admin";
import MobileHeaderNav from "@/components/MobileHeaderNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vet Head 2026",
  description: "Vet Head golf tournament hub",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adminUser = await getBillAdminUser();

  return (
    <html lang="en">
      <body>
        <header className="appHeader">
          <Link className="brandLink headerLogoLink" href="/">
            <Image
              src="/images/vet-head-logo.png"
              alt="Vet Head"
              width={180}
              height={100}
              priority
              className="headerLogoImage"
            />
          </Link>

          <nav className="headerNav">
            <Link href="/">Tournament Hub</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/teams">Pairings</Link>
            <Link href="/scoreboard">Scoreboard</Link>
            {adminUser ? (
              <>
                <Link href="/admin">Admin</Link>
                <Link href="/login">Account</Link>
              </>
            ) : (
              <Link href="/login">Sign In</Link>
            )}
          </nav>

          <MobileHeaderNav isAdmin={Boolean(adminUser)} />
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

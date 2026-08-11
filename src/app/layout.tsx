import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBillAdminUser } from "@/lib/auth/admin";
import { getScoreEntryUser } from "@/lib/auth/score-entry";
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
  const scoreEntryAccess = await getScoreEntryUser();
  const hasScoreEntryAccess = Boolean(scoreEntryAccess);

  return (
    <html lang="en">
      <body>
        <header className="appHeader">
          <Link className="brandLink headerLogoLink" href="/">
            <Image
              src="/images/vet-head-logo-final.png"
              alt="Vet Head"
              width={815}
              height={850}
              unoptimized
              priority
              className="headerLogoImage"
            />
          </Link>

          <nav className="headerNav">
            <Link href="/">Tournament Hub</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/teams">Pairings</Link>
            <Link href="/scoreboard">Scoreboard</Link>
            <Link href="/prize-money">Payouts</Link>

            {hasScoreEntryAccess && (
              <Link href="/score">Score Entry</Link>
            )}

            {adminUser ? (
              <>
                <Link href="/admin">Admin</Link>
                <Link href="/login">Account</Link>
              </>
            ) : hasScoreEntryAccess ? (
              <Link href="/login">Account</Link>
            ) : (
              <Link href="/login">Sign In</Link>
            )}
          </nav>

          <MobileHeaderNav
            isAdmin={Boolean(adminUser)}
            hasScoreEntryAccess={hasScoreEntryAccess}
          />
        </header>

        <main>{children}</main>
      
      <footer className="fourPuttFooter">
        <Image
          src="/images/built-by-four-putt.png"
          alt="Built By Four Putt Productions"
          width={1536}
          height={1024}
          className="fourPuttFooterImage"
          unoptimized
        />
      </footer>

    </body>
    </html>
  );
}

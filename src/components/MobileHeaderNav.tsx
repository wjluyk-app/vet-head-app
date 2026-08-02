"use client";

import Link from "next/link";
import { useState } from "react";

type MobileHeaderNavProps = {
  isAdmin: boolean;
};

export default function MobileHeaderNav({ isAdmin }: MobileHeaderNavProps) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <div className="mobileHeaderControls">
      <Link className="mobileScoreboardButton" href="/scoreboard">
        Scoreboard
      </Link>

      <button
        type="button"
        className="mobileMenuButton"
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open ? (
        <nav className="mobileHeaderMenu" id="mobile-site-menu">
          <Link href="/" onClick={closeMenu}>
            Tournament Hub
          </Link>
          <Link href="/player-guide" onClick={closeMenu}>
            Player Guide
          </Link>
          <Link href="/teams" onClick={closeMenu}>
            Teams &amp; Pairings
          </Link>
          <Link href="/schedule" onClick={closeMenu}>
            Schedule
          </Link>
          <Link href="/scoreboard" onClick={closeMenu}>
            Scoreboard
          </Link>
          <Link href="/prize-money" onClick={closeMenu}>
            Prize Structure
          </Link>
          <Link href="/final-results" onClick={closeMenu}>
            Final Payouts
          </Link>
          <Link href="/archive" onClick={closeMenu}>
            Tournament Archive
          </Link>
          <Link href="/upcoming-years" onClick={closeMenu}>
            Upcoming Years
          </Link>
          {isAdmin ? (
            <>
              <Link href="/admin" onClick={closeMenu}>
                Admin
              </Link>
              <Link href="/login" onClick={closeMenu}>
                Account
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={closeMenu}>
              Sign In
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}

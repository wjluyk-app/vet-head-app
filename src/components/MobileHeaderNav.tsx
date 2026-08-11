"use client";

import Link from "next/link";
import { useState } from "react";

type MobileHeaderNavProps = {
  isAdmin: boolean;
  hasScoreEntryAccess: boolean;
};

export default function MobileHeaderNav({
  isAdmin,
  hasScoreEntryAccess,
}: MobileHeaderNavProps) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <div className="mobileHeaderControls">
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
          <Link href="/schedule" onClick={closeMenu}>
            Schedule
          </Link>
          <Link href="/teams" onClick={closeMenu}>
            Pairings
          </Link>
          <Link href="/scoreboard" onClick={closeMenu}>
            Scoreboard
          </Link>
          <Link href="/prize-money" onClick={closeMenu}>
            Payouts
          </Link>

          {hasScoreEntryAccess && (
            <Link href="/score" onClick={closeMenu}>
              Score Entry
            </Link>
          )}

          {isAdmin ? (
            <>
              <Link href="/admin" onClick={closeMenu}>
                Admin
              </Link>
              <Link href="/login" onClick={closeMenu}>
                Account
              </Link>
            </>
          ) : hasScoreEntryAccess ? (
            <Link href="/login" onClick={closeMenu}>
              Account
            </Link>
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

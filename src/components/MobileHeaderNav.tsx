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
          <Link href="/schedule" onClick={closeMenu}>
            Schedule
          </Link>
          <Link href="/teams" onClick={closeMenu}>
            Pairings
          </Link>
          <Link href="/scoreboard" onClick={closeMenu}>
            Scoreboard
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

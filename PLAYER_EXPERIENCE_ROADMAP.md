# Cubby Cup App — Player Experience Roadmap

## Purpose

Review and improve the entire Cubby Cup application from the perspective of a first-time player.

The player should be able to answer quickly:

1. Where do I go?
2. Who am I playing with and against?
3. When do I play?
4. Which course and tee do I use?
5. What format are we playing?
6. Where am I staying?
7. How is the tournament scored?
8. What is the current score?
9. What can I win?
10. Who do I contact?

---

# PHASE 1 — MOBILE FOUNDATION

## 1. Eliminate horizontal clipping

Fix all player-facing pages so that no page content extends beyond the phone viewport.

Pages to verify:

- Tournament Hub
- Player Guide
- Teams & Pairings
- Schedule
- Friday
- Saturday
- Sunday
- Scoreboard
- Prize Structure
- Final Payouts

Required result:

- No content wider than `100vw`
- No accidental horizontal scrolling
- No clipped titles, score panels, cards, tables, or totals
- Appropriate page padding on small screens

## 2. Replace the mobile navigation

Desktop navigation may remain visible.

On mobile:

- Show the Cubby Cup logo
- Show a clear Menu button
- Keep Scoreboard readily accessible
- Place the remaining destinations inside the mobile menu

Menu destinations:

- Tournament Hub
- Player Guide
- Teams & Pairings
- Schedule
- Scoreboard
- Prize Structure
- Final Payouts
- Sign In / Admin

## 3. Make all hero sections and score strips responsive

Fix:

- Home-page tournament title
- Team Luke and Team Sam totals
- Championship score strips
- Player Guide summary statistics
- Prize pool totals
- Payout reconciliation totals
- MVP feature

## 4. Create true mobile layouts

On small screens:

- Stack multi-column sections vertically
- Keep cards full width
- Use readable font sizes
- Avoid compressed desktop tables
- Keep buttons large enough to tap
- Keep spacing consistent

## 5. Improve tables on mobile

Tables must either:

- Transform into stacked cards, or
- Use a deliberate contained horizontal scroll area with clear visual treatment

Do not allow the entire page to overflow horizontally.

---

# PHASE 2 — PLAYER USABILITY

## 6. Add a Start Here section

Near the top of the Tournament Hub, add a short first-time-player guide.

Suggested wording:

> New player? Start with the Player Guide, find your team and tee times, then use the Scoreboard during the tournament.

Primary actions:

- Open Player Guide
- Find Teams & Pairings
- View Schedule
- Open Scoreboard

## 7. Add a Find My Name / My Weekend experience

Create a player-focused view that lets a player select or find their name.

The player should then see:

- Team
- Handicap index
- Tee assignment
- Unit assignment
- Friday partner
- Friday opponents
- Friday tee time
- Saturday partner
- Saturday opponents
- Saturday tee time
- Sunday Pinehurst partner and opponents
- Sunday Singles opponent
- Sunday tee time
- Individual payouts, when published

## 8. Improve Teams & Pairings on mobile

Desktop tables may remain.

On mobile:

- Show player cards or match cards
- Make names easy to locate
- Clearly identify partner and opponents
- Display tee time prominently
- Display tee assignment and handicap clearly

## 9. Improve Schedule on mobile

Stack each day vertically:

- Friday
- Saturday
- Sunday

Each day must display:

- Date
- Course
- Format
- First tee time
- Every match
- Every tee time
- Important player reminders

## 10. Improve Scoreboard on mobile

Keep the overall Cubby Cup score visible at the top.

Create full-width collapsible sections:

- Friday
- Saturday
- Sunday Pinehurst
- Sunday Singles
- Friday Skins

Each collapsed section should show a useful summary before expansion.

## 11. Clarify money-related sections

Rename player-facing terminology:

- `Prize Money` → `Prize Structure`
- `Payouts` → `Final Payouts`, where clarification is helpful

Explain the distinction:

- Prize Structure = what is available to win
- Final Payouts = what each player actually earned

## 12. Improve action labels

Replace repeated generic labels such as `Open section` with destination-specific actions.

Examples:

- View overall score
- View Friday results
- Find my team
- View tee times
- Read Player Guide
- View prize structure
- View final payouts

---

# PHASE 3 — CONTENT AND POLISH

## 13. Correct grammar

Replace:

> Team Luke are the 2026 Cubby Cup Champions.

With either:

> Team Luke is the 2026 Cubby Cup Champion.

Or:

> The members of Team Luke are the 2026 Cubby Cup Champions.

## 14. Standardize tournament terminology

Use consistent capitalization and naming throughout the app:

- Best Ball
- 2-Man Scramble
- Pinehurst
- Singles
- Tee Time
- Match Time
- Four Putt Productions
- Team Luke
- Team Sam

## 15. Explain tournament scoring

Add a short explanation that:

- 54 total Cubby Cup points are available
- 27 points produces a tie
- 27.5 points guarantees victory

## 16. Explain payout validation

Clarify any labels such as `54/54`.

A first-time player should understand exactly what has been completely accounted for or validated.

## 17. Improve Player Guide mobile presentation

On mobile:

- Welcome letter full width
- Four Putt Productions image below the letter
- Randy and Bill contact information below the image
- Summary cards stack properly
- PDF button remains prominent

## 18. Improve Final Payouts usability

Add:

- Player-name search or filter
- Clear sorting
- Full-width mobile payout cards
- Team total
- Individual total
- MVP award
- Full $1,800 reconciliation

## 19. Reduce unnecessary empty space

Review desktop day pages and tighten oversized empty areas while preserving the established visual system.

## 20. Preserve visual identity

Continue using:

- Navy
- Gold
- White
- Cubby Cup logo as the primary identity
- Four Putt Productions selectively
- Rounded cards
- Clear section headings
- Consistent day labels

Do not redesign the established visual identity unless specifically requested.

---

# FINAL VALIDATION CHECKLIST

Before this roadmap is considered complete:

- Test every page on desktop
- Test every page at 390px mobile width
- Test navigation
- Confirm no horizontal page overflow
- Confirm every player can locate their name
- Confirm all dates
- Confirm all courses
- Confirm all tee times
- Confirm all formats
- Confirm all handicap references
- Confirm all tee assignments
- Confirm all team assignments
- Confirm all matchups
- Confirm all scoring totals
- Confirm all payout totals
- Confirm the full $1,800 reconciliation
- Run the complete automated test suite
- Run the production build
- Capture final desktop and mobile screenshots
- Review the app again as a first-time player

---

# IMPLEMENTATION ORDER

1. Global mobile width and overflow
2. Mobile navigation
3. Responsive home page and Start Here
4. Player Guide mobile layout
5. Teams & Pairings mobile layout
6. Schedule mobile layout
7. Scoreboard mobile layout
8. Prize Structure terminology and layout
9. Final Payouts layout and search
10. My Weekend player lookup
11. Grammar and terminology consistency
12. Final full-app validation

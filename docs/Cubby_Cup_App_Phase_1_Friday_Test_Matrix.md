# Cubby Cup App — Phase 1 Friday Test Matrix

## Scoring
- Import all 24 players without duplicates.
- Import six Friday pairings.
- Create exactly two team scorecards per pairing.
- Require 18 NET scores per team scorecard.
- Confirm no handicap subtraction occurs after entry.
- Calculate hole winners and halves.
- Calculate front-nine, back-nine and total Cup points.
- Reproduce Luke 8 / Sam 10.

## Field competition
- Use the same hole-score records used for match play.
- Reproduce all front, back and total scores.
- Apply configured first/second payouts.
- Reproduce $450 total.
- Confirm tied ranks do not create unconfigured payouts.

## Skins
- Require unique low NET score.
- For holes 1–17 validate with net par or better on next hole.
- Hole 18 bypasses validation.
- Reject tied lows.
- Reproduce Hole 6 and Hole 14 only.
- Reconcile to $200.

## MVP and money leaders
- Credit each team-format result to both partners.
- Preserve player-level calculation trace.
- Reproduce Friday money leaders:
  - M. Hammonds $175
  - R. Walls $175
  - B. Luyk $125
  - B. Walls $125
  - C. Mead $25
  - L. Swardo $25
- Reconcile Friday money to $650.

## Workflow and audit
- Prevent publishing while Friday is open or incomplete.
- Lock a data snapshot before PDF generation.
- Require a reason to reopen a locked session.
- Record old and new score values.
- Mark prior publication potentially outdated after a correction.
- Generate a new version instead of overwriting.

## PDF
- Produce exactly five pages.
- Preserve V11 layout hierarchy.
- Footer must read Journal Page X of 5.
- Exclude all Saturday and Sunday material.
- Verify no clipped names, dollar amounts, tables or footers.

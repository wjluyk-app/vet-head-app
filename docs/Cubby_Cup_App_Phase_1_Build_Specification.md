# Cubby Cup App — Phase 1 Build Specification

**Project:** Cubby Cup App Development Project  
**Version:** 0.1 — Initial Build Baseline  
**Date:** July 29, 2026  
**Authoritative source files:**

- `Cubby_Cup_App_2026_Source_Workbook_v68.xlsx`
- `Cubby_Cup_App_2026_Players_Guide_Master.pdf`
- `Cubby_Cup_App_2026_Championship_Journal_V11_Master.pdf`

## 1. Phase 1 objective

Build a private, responsive web-app prototype that imports the approved 2026 Cubby Cup workbook, generates the pre-tournament Players Guide, supports mobile Friday net-team score entry, reproduces the approved Friday scoring and money results exactly, and generates the locked five-page Friday publication in the V11 visual system.

Phase 1 is accepted only when application output matches the workbook and approved PDFs exactly.

## 2. Locked source-of-truth order

Until parity is proven, the source-of-truth order is:

1. Approved 2026 workbook for calculations and tournament data.
2. Approved 12-page Players Guide for pre-tournament publication structure.
3. Approved V11 16-page journal for results-publication structure and visual design.
4. App database only after successful import and reconciliation.

The app may not silently alter imported source values.

## 3. Phase 1 scope

### Included

- Private authentication
- Administrator and scorekeeper roles
- Workbook import
- Player, team, tee, housing, pairing, and schedule review
- Players Guide preview, versioning, and publication
- Friday score-entry workflow
- Offline-tolerant local score caching
- Friday match scoring
- Friday field rankings and payouts
- Friday skins
- Friday MVP standings
- Friday money leaders
- Audit logging
- Session review, lock, reopen, and publish controls
- Five-page Friday V11 PDF
- Workbook parity report
- Publication archive

### Excluded from Phase 1

- Saturday score entry and result publication
- Sunday Pinehurst score entry
- Sunday Singles score entry
- Full 16-page final journal generation
- Native iOS or Android apps
- Venmo integration
- SMS, email, or push notification distribution
- Automated pairing-draft logic
- Historical multi-year platform

## 4. Verified workbook baseline

### Workbook sheets

- Players
- Master Accounting
- Match Setup
- Friday Net Scores
- Saturday Net Scores
- Sunday Pinehurst
- Sunday Singles
- Results
- Payouts
- Payout Summary
- MVP Detail
- Skins
- MVP
- Team Review
- Teams
- Email Packets
- Lists
- Match Handicaps
- README
- Courses
- Control

### Friday score-entry rule

The workbook states that only the two-man team’s **NET score by hole** is entered. The app must store one score per team per hole and must not apply a second handicap adjustment.

The same Friday hole-score records must drive:

- Head-to-head match play
- Front-nine field ranking
- Back-nine field ranking
- Total field ranking
- Friday skins
- Friday money leaders

No duplicate Friday score source is permitted.

## 5. Verified 2026 acceptance targets

### Friday Cup points

| Team | Points |
|---|---:|
| Team Sam | 10 |
| Team Luke | 8 |
| Total | 18 |

### Friday match results

| Match | Team Luke pair | Team Sam pair | Luke points | Sam points | Result |
|---:|---|---|---:|---:|---|
| 1 | B. Stone / K. Swardenski | L. Bush / M. Stone | 1.5 | 1.5 | Halved |
| 2 | R. Walls / M. Hammonds | B. Luyk / B. Walls | 2.0 | 1.0 | Luke |
| 3 | M. Parks / B. Mogg | J. Mead / C. Hiotas | 0.5 | 2.5 | Sam |
| 4 | G. Hoodhood / D. Schuch | E. Blanding / S. Morgan | 1.5 | 1.5 | Halved |
| 5 | L. Swardo / C. Mead | N. Schaut / C. Olszewski | 2.0 | 1.0 | Luke |
| 6 | S. Chapman / S. Tedhams | S. Swardo / N. Swardenski | 0.5 | 2.5 | Sam |

### Friday field payouts

| Pair | Front | Back | Total | Team payout |
|---|---:|---:|---:|---:|
| R. Walls / M. Hammonds | 34 | 32 | 66 | $250.00 |
| B. Luyk / B. Walls | 32 | 36 | 68 | $150.00 |
| L. Swardo / C. Mead | 36 | 34 | 70 | $50.00 |

Friday field pool: **$450.00**

### Friday skins

| Hole | Pair | Net score | Team payout | Per player |
|---:|---|---:|---:|---:|
| 6 | B. Luyk / B. Walls | 2 | $100.00 | $50.00 |
| 14 | R. Walls / M. Hammonds | 1 | $100.00 | $50.00 |

Friday skins pool: **$200.00**

Skins rule: unique low NET team score. Holes 1–17 require net par or better on the next hole. Hole 18 requires no next-hole validation. Tied lows do not pay.

### Friday money leaders

| Player | Friday field | Friday skins | Friday total |
|---|---:|---:|---:|
| M. Hammonds | $125.00 | $50.00 | $175.00 |
| R. Walls | $125.00 | $50.00 | $175.00 |
| B. Luyk | $75.00 | $50.00 | $125.00 |
| B. Walls | $75.00 | $50.00 | $125.00 |
| C. Mead | $25.00 | $0.00 | $25.00 |
| L. Swardo | $25.00 | $0.00 | $25.00 |

Friday money awarded: **$650.00**

### Full-event regression targets retained for later phases

- Through Saturday: Team Luke 20, Team Sam 16
- After Sunday Pinehurst: Team Luke 22.5, Team Sam 19.5
- Final: Team Luke 28, Team Sam 26
- Final MVP: L. Swardo, 7 points
- Grand payout total: $1,800.00

## 6. Players Guide publication

The approved Players Guide is a 12-page pre-tournament publication. Phase 1 must create a data-driven version with the same structure:

1. Cover
2. Welcome letter
3. Weekend overview
4. Formats, points, and payouts
5. Tournament rules, logistics, pairing structure, and housing
6. Team Luke roster
7. Team Sam roster
8. Friday tee sheet
9. Saturday tee sheet
10. Sunday Pinehurst tee sheet
11. Sunday Singles tee sheet
12. Handicap and player reference

### Players Guide lifecycle

- Draft
- Administrator review
- Approved
- Published
- Superseded

Any change to a published player, team, tee assignment, housing assignment, pairing, tee time, or tournament rule must mark the current guide as outdated and require a new version.

Suggested filename:

`Cubby_Cup_App_2026_Players_Guide_V1.pdf`

## 7. Friday publication

Phase 1 must generate exactly five pages:

1. Reader Guide
2. Friday Results Summary
3. Friday Field Competition
4. Friday Awards
5. Friday Money Leaders

Required footer:

`Journal Page X of 5`

Suggested filename:

`Cubby_Cup_App_2026_Friday_Results_V1.pdf`

The PDF must not include Saturday, Sunday, champions, or final payout content.

## 8. Application architecture

### Recommended stack

- Frontend: Next.js with TypeScript
- UI: responsive server-rendered web interface
- Database: PostgreSQL
- Authentication: Supabase Auth or equivalent
- File storage: private object storage
- PDF renderer: Playwright server-side print rendering
- Hosting: Vercel or equivalent
- Source control: private GitHub repository owned by the tournament organization

### Environment separation

- Local development
- Test/staging
- Production

Production credentials and data must not be used in local development.

## 9. Initial database model

### users

- id
- email
- display_name
- role
- active
- created_at
- last_login_at

### tournaments

- id
- name
- year
- venue
- start_date
- end_date
- status
- payout_pool
- visual_template_version
- created_at
- updated_at

### teams

- id
- tournament_id
- name
- short_name
- captain_player_id
- display_color
- draft_order
- pairing_advantage_note

### players

- id
- first_name
- last_name
- display_name
- short_display_name
- email
- mobile
- birth_date
- active
- notes

### tournament_players

- id
- tournament_id
- player_id
- team_id
- captain
- handicap_index
- course_handicap
- friday_playing_handicap
- saturday_playing_handicap
- sunday_pinehurst_handicap
- sunday_singles_handicap
- default_tee
- adjusted_tee
- tee_rule_reason
- tee_override
- tee_override_by
- tee_override_at
- housing_unit
- payment_status

### sessions

- id
- tournament_id
- name
- day
- course
- format
- hole_count
- status
- skins_enabled
- field_payouts_enabled
- publication_state

### pairings

- id
- session_id
- match_number
- tee_time
- starting_hole
- order_number
- match_point_value
- locked

### pairing_entries

- id
- pairing_id
- side
- participant_type
- participant_id
- display_order

### scorecards

- id
- pairing_id
- side
- scoring_entity_id
- status
- submitted_by
- submitted_at
- locked_at

### hole_scores

- id
- scorecard_id
- hole_number
- net_score
- entered_by
- entered_at
- synced_at
- source
- revision

Unique constraint: one record per scorecard and hole.

### match_hole_results

- id
- pairing_id
- hole_number
- winner_side
- status_after_hole
- holes_up
- holes_remaining

### match_results

- id
- pairing_id
- winner_side
- result_text
- side_a_points
- side_b_points
- finalized_at

### payout_rules

- id
- session_id
- category
- place
- amount
- tie_rule
- residual_rule
- enabled

### payout_results

- id
- session_id
- category
- recipient_type
- recipient_id
- raw_amount
- adjustment
- final_amount
- calculation_trace

### skin_results

- id
- session_id
- hole_number
- winning_score
- winning_scorecard_id
- validated
- validation_reason
- team_amount
- player_amount

### mvp_results

- id
- player_id
- session_id
- points
- reason
- adjustment
- source_match_id

### publications

- id
- tournament_id
- stage
- version
- filename
- storage_path
- generated_by
- generated_at
- published_at
- data_snapshot_id
- page_count
- checksum
- status

### audit_records

- id
- entity_type
- entity_id
- field_name
- old_value
- new_value
- changed_by
- changed_at
- reason
- affected_publication

## 10. Required application screens

### Private login

- Email or passwordless authentication
- Role-aware routing
- Session timeout

### Administrator dashboard

- Tournament status
- Players Guide publication status
- Friday scoring readiness
- Missing scores
- Unsubmitted scorecards
- Friday Cup score
- Payout reconciliation
- Publication readiness

### Players and teams

- Workbook import
- Import preview
- Duplicate and missing-name warnings
- Team rosters
- Captains
- Handicap and tee details
- Housing assignments
- Payment status

### Pairings and schedule

- Friday through Sunday pairings
- Tee times
- Starting holes
- Match order
- Lock and unlock controls

### Players Guide

- Data readiness checklist
- Twelve-page preview
- Version generation
- Publish and supersede controls

### Friday score entry

- Select match
- Display both teams and tee time
- Current hole
- Large numeric score controls
- Previous/next hole
- Live hole winner
- Live match status
- Autosave and synchronization indicator
- Submit scorecard

### Friday results

- Match results
- Team points
- Field leaderboard
- Skins
- MVP standings
- Money leaders

### Reconciliation and publication

- Missing-score check
- Match-points check
- Field-pool check
- Skins-pool check
- Player-money check
- PDF page-count check
- Generate draft
- Preview
- Publish
- Archive

### Audit log

- Score changes
- Pairing changes
- Payout changes
- Session lock/reopen actions
- Publication actions

## 11. Friday score-entry behavior

1. Scorekeeper selects Friday and a match.
2. App opens at the pairing’s starting hole.
3. Scorekeeper enters one net team score for each side.
4. Score is written to local cache immediately.
5. App attempts server synchronization.
6. App calculates hole winner and live match status.
7. Scorekeeper advances to the next hole.
8. App warns about blanks and unusual scores.
9. Scorekeeper submits the card.
10. Administrator reviews and locks the session.

The application must never ask for individual gross scores in Friday team scoring.

## 12. Offline-tolerant behavior

- Save each score locally before server confirmation.
- Show Pending, Synced, or Conflict status.
- Retry pending records automatically.
- Preserve local records across refreshes and screen locks.
- Detect conflicting server revisions.
- Require an explicit decision before overwriting newer data.
- Record all conflict resolutions in the audit log.

## 13. Friday match scoring rules

For each hole:

- Lower net team score wins the hole.
- Equal scores halve the hole.
- Match status is recalculated after every completed hole.
- Match can close early when the lead exceeds holes remaining.
- Final results include `X & Y`, `1 Up`, and `Halved`.

For the current 2026 Friday format, each match produces three Cup points across front nine, back nine, and total. Point allocation must remain configurable at session level.

## 14. Payout logic

### Friday field

- Front: first $100, second $50
- Back: first $100, second $50
- Total: first $100, second $50
- Team awards split evenly between partners
- Ties split the combined prize positions according to the workbook method
- Final total must equal $450.00

### Friday skins

- Pool: $200.00
- Unique low NET team score
- Holes 1–17 require next-hole net-par-or-better validation
- Hole 18 requires no validation
- Ties do not pay
- Pool is divided among valid skins
- Team amount is split evenly between partners

### Reconciliation

The app must produce a calculation trace showing:

- Input scores
- Ranks
- Tie group
- Available prize positions
- Raw allocation
- Residual-cent allocation
- Final team and player amount

## 15. MVP logic

- Team-format match points are credited to both players.
- Singles points are credited to the individual.
- Final MVP eligibility is limited to the winning team.
- Highest eligible total receives the MVP pot.
- A tie splits the pot.
- Manual adjustments require an audit reason.

Phase 1 displays Friday MVP standings, while final eligibility is determined only after the tournament is complete.

## 16. Session lifecycle

1. Setup
2. Open for scoring
3. Scores submitted
4. Administrator review
5. Locked
6. Published

A published session that is reopened must mark its publication as outdated. A regenerated PDF creates a new version and does not overwrite the prior publication.

## 17. Publication validation gates

The five-page Friday PDF cannot be published until:

- All 12 Friday team scorecards contain 18 scores.
- All six matches calculate successfully.
- Friday Cup points total 18.
- Validation fixture equals Sam 10, Luke 8.
- Friday field payouts total $450.00.
- Friday skins total $200.00.
- Friday player money totals $650.00.
- No unresolved score conflicts exist.
- The session is locked.
- The PDF page count is exactly five.
- Every footer shows `Journal Page X of 5`.
- No Saturday or Sunday content appears.

## 18. Automated tests

### Unit tests

- Hole winner
- Halved hole
- Live match status
- Early match close
- Front/back/total calculation
- Ranking and tie groups
- Skin uniqueness
- Skin validation pass/fail
- Per-team and per-player payout split
- Residual-cent allocation
- MVP crediting

### Integration tests

- Import 2026 workbook
- Create all Friday entities
- Calculate every match
- Calculate all field payouts
- Calculate skins
- Calculate Friday MVP
- Calculate money leaders
- Generate five-page PDF

### Regression tests

The fixed 2026 dataset must continue producing all acceptance targets listed in Section 5 after every scoring-engine change.

## 19. Build sequence

### Sprint 1 — Source mapping and database

- Workbook field map
- Database migrations
- Import preview
- 2026 seed fixture

### Sprint 2 — Tournament setup and Players Guide

- Players and teams
- Pairings and schedule
- Tee and housing review
- Twelve-page Players Guide renderer
- Publication versioning

### Sprint 3 — Friday scoring

- Mobile scorecard
- Local caching and synchronization
- Match engine
- Session submission and lock

### Sprint 4 — Friday money and awards

- Field rankings
- Payout engine
- Skins
- MVP
- Money leaders
- Reconciliation

### Sprint 5 — Friday V11 publication and QA

- Five page templates
- PDF generation
- Workbook parity report
- Visual inspection
- Device and field testing

## 20. Immediate next engineering outputs

1. Workbook-to-database field map.
2. SQL migration draft.
3. JSON 2026 Friday fixture.
4. Application route and permissions matrix.
5. Wireframes for administrator dashboard, Players Guide preview, and mobile Friday score entry.
6. Friday scoring-engine pseudocode and test cases.


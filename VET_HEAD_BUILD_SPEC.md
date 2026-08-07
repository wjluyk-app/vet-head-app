# VET HEAD — BUILD SPEC

## Tournament

Players: 12

Initial player names:
Player 1 through Player 12

All players use the same tees.

Pairings/teams are predetermined before the tournament.
Every round uses different pairings.

## Schedule

### Thursday — August 13
8:00 AM
18-hole Individual Net

### Friday Morning
8:00 AM
18-hole Individual Net

### Friday Afternoon
2:00 PM
4-Man Scramble

### Saturday Morning
8:00 AM
18-hole Individual Net

### Saturday Afternoon
2:00 PM
4-Man Scramble

Total rounds: 5

## Handicap Setup

Player setup requires:
- Player Name
- Handicap Index

Individual playing handicaps are calculated using:
- Handicap Index
- Course Rating
- Slope
- Tee data

Handicap allowance:
100% / Full Handicap

All players use the same tees.

Initial development may use one placeholder course/tee/rating/slope configuration until actual course data is supplied.

## Individual Score Entry

No hole-by-hole scoring.

For each individual round:
- Enter one final 18-hole GROSS score per player.
- App calculates course handicap.
- App calculates final NET score.

There are no individual skins.

## Scramble Score Entry

Each scramble round has:
- 3 teams
- 4 players per team

Enter one final 18-hole GROSS team score.

The app calculates the team handicap using the applicable USGA 4-person scramble handicap formula.

The app calculates the final NET scramble score.

No hole-by-hole scoring is required.

## Competition 1 — VET HEAD

Vet Head is the overall 5-round points competition.

All five rounds award group/team points.

For every round:
- Three groups/teams are ranked against each other.
- 1st place group/team = 8 points to EACH player in that group
- 2nd place group/team = 6 points to EACH player in that group
- 3rd place group/team = 4 points to EACH player in that group

### Individual Rounds

For each individual round:
- Each foursome contains 4 players.
- Each player's NET score is calculated.
- The four NET scores are added together.
- That foursome's combined NET total is compared with the other two foursomes.
- Lowest group total earns 1st-place points.
- Middle group total earns 2nd-place points.
- Highest group total earns 3rd-place points.

The same individual score therefore serves two purposes:
1. The player's individual Vet Header score.
2. The foursome's Vet Head group total.

### Scramble Rounds

For each scramble round:
- Three 4-player teams compete.
- Teams are ranked by final NET scramble score.
- Lowest NET team score = 8 points per player
- Second = 6 points per player
- Third = 4 points per player

## Vet Head Overall Tiebreak

If players finish tied in total Vet Head points:

1. Most 1st-place finishes
2. Most 2nd-place finishes
3. Lowest 54-hole Vet Header individual NET total

## Competition 2 — VET HEADER

Vet Header is an individual competition only.

It uses the three individual NET rounds:

1. Thursday Individual Net
2. Friday Morning Individual Net
3. Saturday Morning Individual Net

Each player's three NET scores are added together.

Lowest 54-hole NET total wins Vet Header.

### Vet Header Tiebreak

1. Lowest Saturday Morning NET score
2. Lowest Friday Morning NET score
3. Lowest Thursday NET score

No co-champions.

## Scoreboard

Use the term:

SCOREBOARD

Do NOT call it "Live Scoreboard."

The Scoreboard should provide:

- Vet Head overall points standings
- Vet Header 54-hole standings
- Individual-round results
- Individual-round foursome/team totals
- Scramble-round team results
- Points awarded by round
- Player cumulative points

One central Scoreboard experience.
Do not create duplicate scoring/results destinations.

## Admin

Initial required admin functions:

- Player Setup
- Course / Tee Setup
- Pairings / Team Setup
- Individual Gross Score Entry
- Scramble Gross Score Entry
- Results Validation
- Scoreboard publication/control as needed

## Branding

Tournament name:

VET HEAD

Primary color:
Michigan State Spartan Green
#18453B

Core palette:
- Spartan Green #18453B
- White
- Dark charcoal / black
- Restrained neutral gray

Visual direction:
- Michigan State-inspired athletic / collegiate identity
- Spartan-style visual language
- Veteran / patriotic cues
- Subtle American elements
- Golf remains part of the visual language
- Avoid realistic soldiers
- Avoid overly militant imagery
- VET HEAD is the dominant title

Use the approved Vet Head logo as the primary visual mark.

## Product / Architecture Rules

Vet Head is the second real-world tournament implementation based on Cubby Cup.

Do:
- Reuse tested Cubby Cup architecture where rules match.
- Reuse handicap, standings, tie, results, admin, mobile, and scoreboard concepts where practical.
- Keep Vet Head isolated from Cubby Cup.
- Keep one central Scoreboard.
- Keep score-entry logic explicit.
- Test every scoring change.
- Keep Git commits small and clear.
- Preserve mobile-first usability.
- Keep tournament-specific rules configurable when clearly appropriate.

Do not:
- Modify the working Cubby Cup app.
- Share the Cubby Cup Supabase database.
- Rebuild working features unnecessarily.
- Add hole-by-hole scoring when Vet Head only needs final totals.
- Build the full future Four Putt Productions self-service platform before Vet Head works.
- Deploy untested scoring changes.

## Current Technical Baseline

Stack:
- Next.js
- TypeScript
- Supabase
- Vercel
- GitHub
- Vitest

Vet Head repository:
wjluyk-app/vet-head-app

Local project:
/Users/billluyk/Documents/vet-head-app

Vet Head has its own:
- GitHub repository
- Supabase project
- Environment configuration

Baseline tests before Vet Head changes:
13 test files passed
47 tests passed
0 failures

Baseline commit:
11ac859

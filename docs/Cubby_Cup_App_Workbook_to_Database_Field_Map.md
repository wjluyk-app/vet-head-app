# Cubby Cup App — Workbook-to-Database Field Map
Version: Phase 1 / 2026 validation fixture

## Source-of-truth hierarchy
1. `Players` is the master source for player identity, team assignment, index, tee and housing inputs.
2. `Control` stores tournament-wide settings.
3. `Match Setup` stores pairings, tee times, match order and stroke references.
4. Team-format score tabs store one NET team score per hole.
5. `Results`, `Payouts`, `Skins`, `MVP`, and `Payout Summary` are calculated outputs used for parity testing.

## Core field mappings

### Tournament
| App field | Workbook source | Notes |
|---|---|---|
| year | Control!B4 | 2026 |
| start_date | Control!B5 | August 28, 2026 |
| end_date | Control!B6 | August 30, 2026 |
| captain_1_name | Control!B7 | Luke Swardenski |
| captain_1_short_name | Control!B8 | L. Swardo |
| captain_2_name | Control!B9 | Sam Swardenski |
| captain_2_short_name | Control!B10 | S. Swardo |
| draft_coin_toss_winner | Control!B11 | S. Swardo |
| pairing_advantage_team | Control!B12 | L. Swardo |
| payout_pool | Payouts!D66 / Payout Summary total | $1,800 validation target |
| visual_template_version | V11 PDF | Locked |

### Player
| App field | Workbook source |
|---|---|
| source_player_id | Players column A |
| team_short_name | Players column B |
| shirt_size | Players column C |
| first_name | Players column D |
| last_name | Players column E |
| display_name | Players column F |
| birthdate | Players column G |
| event_age | Players column I |
| handicap_index | Players column J |
| mountain_white_handicap | Players column K |
| age_plus_mountain_white_handicap | Players column L |
| tee_assignment | Players later columns / Teams tab |
| housing_unit | Players later columns / Players Guide |
| captain_status | Derived from Control captain names |

### Session
| Session | Workbook source | Score entry principle |
|---|---|---|
| Friday | Control B13:B17; Match Setup rows 5–10 | One NET team score per hole |
| Saturday | Control B18:B21; Match Setup rows 11–16 | One NET scramble team score per hole |
| Sunday Pinehurst | Control B22:B25; Match Setup rows 17–22 | Approved net/stroke setup |
| Sunday Singles | Control B26:B27; Match Setup rows 23–34 | Individual match play |

### Pairing
| App field | Workbook source |
|---|---|
| session | Match Setup column A |
| date | Match Setup column B |
| course | Match Setup column C |
| format | Match Setup column D |
| match_number | Match Setup column E |
| throws_first | Match Setup column F |
| tee_time | Match Setup column G |
| team_luke_player_1 | Match Setup column H |
| team_luke_player_2 | Match Setup column I |
| team_luke_hcp_reference | Match Setup column J |
| team_sam_player_1 | Match Setup column K |
| team_sam_player_2 | Match Setup column L |
| team_sam_hcp_reference | Match Setup column M |
| handicap_difference | Match Setup column N |
| strokes_to | Match Setup column O |
| status | Match Setup column P |
| counter_matchup | Match Setup column Q |

### Friday scorecard
| App field | Workbook source |
|---|---|
| pairing | Friday Net Scores column A / row grouping |
| team | Friday Net Scores column B |
| player_1 | Friday Net Scores column C |
| player_2 | Friday Net Scores column D |
| holes_1_to_9 | Friday Net Scores E:M |
| outward_total | Friday Net Scores N |
| holes_10_to_18 | Friday Net Scores O:W |
| inward_total | Friday Net Scores X |
| total | Friday Net Scores Y |
| cup_points | Friday Net Scores Z |
| notes | Friday Net Scores AA |

**Critical rule:** scores in this table are already NET. The app must never subtract a handicap from them.

### Match result
Derived from paired team scorecards:
- hole winner
- holes up/down
- holes remaining
- all square
- dormie
- closed match
- final status
- front-nine points
- back-nine points
- overall points
- session points

Friday validation:
- Luke 8
- Sam 10

### Payout configuration
`Payouts` rows 4–8:
- Friday field: $100/$50 front, $100/$50 back, $100/$50 total
- Friday skins: $200
- Saturday field: $450 configured
- Sunday Pinehurst: $150
- Winning team: $40 per player
- MVP: $70

### Friday payout results
`Payouts` rows 12–24:
- R. Walls / M. Hammonds — $250 team
- B. Luyk / B. Walls — $150 team
- L. Swardo / C. Mead — $50 team
- Total — $450

### Friday skins
`Skins` rows 5–22:
- Unique low NET team score required.
- Holes 1–17 require net par or better on the next hole.
- Hole 18 requires no validation.
- Tied low scores do not pay.
- Hole 6: B. Luyk / B. Walls, net 2, $100 team.
- Hole 14: R. Walls / M. Hammonds, net 1, $100 team.

### MVP
`MVP`:
- Team-format points are credited to both players.
- Singles points are credited to the individual.
- MVP is awarded only among players on the winning team.
- Ties split the configured MVP pot.
- Final fixture: L. Swardo, 7 points, $70.

### Publication
The app must create immutable publication records for:
- Players Guide — 12 pages
- Friday Results — 5 pages
- Through Saturday — 8 pages
- Final Journal — 16 pages

Each publication record must store stage, version, data snapshot, generated timestamp, generated by, published timestamp, file path and checksum.

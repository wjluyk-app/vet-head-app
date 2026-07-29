# Next Build Tasks

Completed in Version 3:
- Workbook-derived 2026 seed
- Real Friday match repository
- Six-match mobile navigation
- Hole-by-hole local score persistence
- Offline/online status
- Score validation API contract
- Supabase browser/server/admin clients
- Authentication page scaffold
- Row-level-security migration
- Initial Supabase tournament/team/player seed script

Next:
1. Complete transactional persistence for sessions, pairings, participants, scorecards and hole scores.
2. Replace prototype score API with authenticated database upsert plus audit record.
3. Implement automatic retry of the offline queue when connectivity returns.
4. Build live match calculations from persisted scores.
5. Build Friday field leaderboard, skins, MVP and money-leader screens from one score source.
6. Implement Players Guide report data model and 12-page V11 renderer.
7. Implement Friday five-page V11 renderer.
8. Add immutable publication snapshots and PDF archive.
9. Run exact workbook parity and visual PDF inspection.

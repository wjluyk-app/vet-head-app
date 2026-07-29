# Version 4 Rollout Checklist

1. Back up the Supabase project.
2. Run migration `0004_live_scoring.sql`.
3. Install updated dependencies.
4. Run all automated tests.
5. Run the production build.
6. Run `npm run seed:supabase`.
7. Confirm 24 players, 4 sessions, 30 pairings and 216 Friday hole scores.
8. Bootstrap Bill as tournament administrator.
9. Configure Supabase Site URL and redirect URLs for localhost and Vercel.
10. Commit and push Version 4.
11. Verify Vercel deployment.
12. Sign in by magic link.
13. Change one Friday hole score.
14. Confirm database persistence and audit record.
15. Restore the original score through the app and confirm a second audit record.

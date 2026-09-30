# Account deletion release checklist

Current implementation is in a draft branch. Before activation:

- Run read-only schema preflight against the real project and confirm every personal table/FK, including legacy tables not present in migrations.
- Confirm backup and restore route. Do not expose private rows in a public PR.
- Check storage ownership and remove private user bytes through Storage API if live schema has any. Current repo Storage usage is shared player/jersey assets, not proof that live Storage has no private bytes.
- Block reinserting personal data with an already-issued JWT after account deletion. Tables without auth.users FK need a server-side live-account guard or validated FK.
- Test a disposable account end to end with representative data and a second account that must remain intact. Test anon, missing session, old JWT, SQL rollback and retry.
- Only then apply SQL with production approval, and merge/publish after explicit release decision.

Local tests use a synthetic schema and do not validate production completeness. No real account was deleted in development.

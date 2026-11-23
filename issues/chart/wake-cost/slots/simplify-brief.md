# Simplify brief: wake-cost (slots B and C, independent)

Worktree /home/ivan/.akrogon/worktrees/akrogon/wake-cost: release 1 3ff3f5b5, release 2 7faab20b, base 814a2387. Design forks/design.md (last blocks). D rounds 1-4: slots/review-D-wake-*.md. Round 4 found F9-F13, all at the seam between state.wait (the cache) and timings.jsonl (the history) across upgrade and rollback: manual seat paths, escaped JSON slugs, bad rows of a prefix slug, prompt append failures.

Every round finds new seam holes because there are two sources of truth carried across two releases in both directions.

Question: what removes the seam instead of patching it? Weigh at least:
- S1. Keep two releases and the import; patch F9-F13.
- S2. One source of truth: state.wait only. No import of timings.jsonl for waits, ever. A leaf with no state.wait (first wake after upgrade, or after a rollback) gets a defined default (e.g. capacity waiters ordered by a cheap existing field, or queued at the wake time). Accept that an upgrade or rollback may reorder capacity waiters once, provided no leaf is stranded, none is dispatched past the cap, and visit timing stays correct or is measurably off only once. Possibly one release instead of two.
- S3. One source of truth: timings.jsonl only, made cheap (e.g. tail read, or an index), no state cache.
Per option: what it breaks or invites later (stranding, double dispatch, visit counts, timing reports), what D's F1-F13 become, size, file:line. Is wait order across a rollback worth anything to the operator (signposts: merge speed first, simplest, low maintenance)? Recommend one.

Do not edit code. Write slots/simplify-<your letter>.md.

# Review A: self-update

Base: 9e2dfbebcfd98e647d34bed995741410ce95c2e4 · Reviewed head: 64545bc · debate: no (positions expected absent)

## Evidence

- Diff `9e2dfbe..64545bc` inspected in full: src/install.ts split, src/self-update.ts, src/phase.ts `to` field, src/akrogon.ts + src/next.ts wiring, docs/guide/install.md, both test files. Worker reports and report.md cross-checked against the diff; all claims verified.
- Checks already green on this head (format, typecheck, full `bun test` 687 pass, test_changed 273 pass) — no rerun trigger beyond the doc finding below, which needs no test.
- `git log --format=%B 9e2dfbe..HEAD` → three `Test-Change:` trailers, each satisfied (added cases only, or formatting only; no expectation changed).
- No AREA.md files changed — the path-listing rule does not apply.
- Docs followed: install.md rewritten correctly (triggers, one-line contract, remedies, retry-at-next-trigger). next.md, phases.md, merge.md, cheat.md carry no update-the-checkout claim (`akrogon pull` in cheat.md is the issue-mirror command, unrelated). gacp.md's `git pull --rebase` is an unrelated helper script.
- Verified against design: identity via realpath inside the step; install lock wraps the sequence, global lock only around the ff (order install→global); `withSetup`'s per-worktree `akrogon-install.lock` is a different file (worktree git dir vs root `.git`), so no ABBA between selfUpdate and setup-flocked check commands; ff under global lock only; never checkout/stash/reset/rebase; one line; never throws; mergeWake call precedes the pause check inside the existing try; next triggers placed before the global-lock block; `to` undefined on hold/split commits; `MoveCommittedError.to` path verified in akrogon.ts catch.
- `phaseCommand.to = requested` is a true-over-approximation only where redirects exist (`check.review`→verdict, `check.fix`→`failed` cap); `merged` requests never redirect, so the only consumer gate `to === 'merged'` cannot false-positive. Recorded as a limitation, not a defect.

## Findings

### Fix 1 — README.md still instructs `git pull`

- Location: `README.md:81-85` ("The links use this checkout. Update it with: `git pull`").
- Realistic source: an operator following the README install section runs `git pull` in the akrogon checkout — the normal user action the page exists for.
- Consequence today: two operator-facing pages disagree on how the checkout updates; worse, the operator's configured `pull.rebase=true` makes `git pull` rebase local commits, contradicting this leaf's ff-only, never-rebase semantics documented in install.md and locked in the design's correction.
- Criterion/gap: criterion 9 (docs describe self-update, no `git pull` instruction) plus the implement contract to update every doc the diff makes stale; install.md was updated, its README sibling was missed.
- Repair: mirror install.md's replacement in the README block — landed work deploys itself on merge landing and `akrogon next` runs; the operator still acts on the reported remedies. No `git pull` instruction.

## Verdict

`fix` — one Fix (README doc staleness). Everything else verified clean.

### Nits

- Fetch-failure line verified by construction only (no dedicated test): a failed fetch is a real path (network drop); the line's components are already covered by neighboring assertions, and adding a test means only deleting the fixture remote — cheap but not required by a criterion. Promotion evidence: a user-visible report of a misleading line after a real fetch failure.
- `bun run format` at base rewrites `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` (pre-existing drift, reverted here, unrelated to this diff): any seat running `checks.format` in the worktree will dirty it. Promotion evidence: none needed at leaf level; worth a base-only format commit outside this leaf.

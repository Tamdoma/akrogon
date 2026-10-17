# Implementation report: any-consultants

Serial-solo run (plan wave 1 holds one unit, S1). No workers, no sub-briefs.

## Refresh history

- 2026-10-17 pass 2: fetched `origin/main` → `0dfae20` (`test: timing-report backlog ages follow the clock, not fixed bounds`), which repairs the date-rotted bound recorded as the pass-1 blocker. Rebased `any-consultants` cleanly onto `0dfae20` (one commit, no conflicts). Prior base `f7baddc` → new base `0dfae20`; prior head `905509a` → new head `b92b060` (same diff).

## Changes

Commit `b92b060` on branch `any-consultants`, base `0dfae20` (diff identical to pass-1 `905509a`):

- `skills/chart-issues/SKILL.md`: first reply names each supplied peer pane in naming order (first named peer is B, then C, D…), `single slot` when none; pane creation creates B right of A and each further peer by splitting the previous peer's pane down (0.5), all created peers sharing the right 35% with each later peer half the previous peer's height, under the existing A-fills-tab gate; agreeing-slot tag examples extended with `(A,B,C,D)` in Take and Handoff; direct route states B is the first named peer.
- `skills/chart-issues/assets/questions.md`: same roster sentence and pane-creation rule in Blind peer exchange; brief-pointer letters `(A, B, C, D)`; example path series extended with `map-D.md`, `fork-name-D.md`, `fork-name-rebuttal-D.md`, `fork-name-final-check-D.md`; merge tags gain `(A,B,C,D)`; peers excluded from every other peer's work/map.
- `docs/guide/chart.md`: peer section states any number of named peers blind to A and to every other peer; diagram column generalized to `each further peer researches independently`.

Removed wordings: `C is named only with B`, `optionally C`, `then the C pane when given`, `herdr pane split <B pane> --direction down`, `B and C sharing the right 35%`.

## Proof results

| Criterion | Proof | Command | Commit | Result |
|---|---|---|---|---|
| C1–C5 | roster-check structural assertions | `bun /tmp/any-consultants-roster-check.ts <worktree>` | b92b060 | green: `check roster-green: 0 .../check-roster-green-1792224708162-860816.log` (red at plan.synthesis: `check roster-red2: 1 .../check-roster-red2-1792223100706-793783.log`) |
| C6 | exact owned-file diff | `git diff --name-only "$AKROGON_BASE"...HEAD` equals the three paths | b92b060 | green: `check owned-files: 0 .../check-owned-files-1792224708257-860954.log` |
| V3 | `akrogon verify` (format, test, typecheck on fresh checkout) | `akrogon verify` | b92b060 | green: `verify leaf b92b060…: green` — 993 pass 0 fail; `check-test-1792224916883-861525.log`, `check-typecheck-1792224919795-861525.log` |

Wall times: roster-green and owned-files seconds; `akrogon verify` ~4 min (suite 203.1 s + typecheck).

## Prior pass blocker — resolved on main

Pass 1 ended `failed`: `checks.test` red on `tests/timing-report.test.ts:534` (`Expected: <= 5 / Received: 6`), a date-rotted bound proven identical on base `f7baddc` (`check base-red-proof2: 0 .../check-base-red-proof2-1792223562947-1998341.log`) and on one protocol retry (`check test-retry: 1 .../check-test-retry-1792223539406-1246402.log`). The repair landed on main as `0dfae20`; after the rebase the suite passes, so no leaf-side repair was needed or made.

## Known limitations

- N1 (carried from plan): sibling leaf `autopilot-mode` edits `SKILL.md` Open and `questions.md`; whichever merges second rebases keeping both outcomes.
- Unverified criteria: none — C1–C6 green on `b92b060`.

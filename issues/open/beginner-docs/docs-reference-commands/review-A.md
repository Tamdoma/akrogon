# Review A: docs-reference-commands (check.review)

Base `0680fda60062a72354f09c08a6c8f5ebe3fd00bd`, reviewed head `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`. The worktree is clean, the head is 8 commits ahead of base, and no `issues/` path is on the branch.

Verdict: **nits**

## Evidence

- Diff scope: `git diff --stat base..HEAD` touches only the planned paths: four `docs/reference/*.md` pages, `tests/AREA.md`, and the three owned test files. `tests/hold-retired.test.ts` is unchanged, per D6.
- Checks: the green leaf receipt for 94fe74fb is in `issues/verify-runs.jsonl` (format, test 1114/0, typecheck). See report.md "akrogon verify".
- Criterion proofs on 94fe74fb: c1, c3, c4, c5, c6 are all exit 0 (report.md). Each widened check has a deliberate break that went red: the C1 sync row on 6ffe5ced, and C3 and C4 nested-page breaks plus the `<img>` unit-case break at synthesis. The tests and their helpers have not changed since those runs.
- `tests/AREA.md`: every `src|tests|skills|docs|plugin` path it names exists. The listing printed nothing missing. The file has 40 lines and its sections are intact.
- Documented behavior: no runtime behavior changed. The pages themselves are the documentation under review.

## Page claims checked against code (sample beyond A's implement-time checks)

- commands.md:
  - `preflight` prints `<remote>/<branch> <sha>` (`src/preflight.ts:75-78`).
  - `park` and `unpark` move between `issues/open` and `issues/parked` (`src/park.ts:10-11`).
  - `close` has no owner check (`src/pull.ts:203`).
  - `land` is launched by next for a command-owned attempt (`src/next.ts:1060`).
- config.md:
  - The harness line must start with the harness name (`src/next.ts:215`).
  - `max_active` caps new starts across registered repos (`src/next.ts:356-402`).
  - `env` names are written to the leaf `.env` (`src/next.ts:276`), and run-check passes `env` and `pass_env` (`src/run-check.ts:64`).
  - `tools` are resolved at merge and a missing tool throws (`src/attempts.ts:59-70`, `src/next.ts:1021`).
  - `worktree_root` defaults to `~/.akrogon/worktrees/<repo>` and must be outside the checkout (`src/config.ts:275-281`).
  - Reserved env names and the name pattern come from `src/config.ts:66-90`.
- skills.md:
  - Phase-to-seat routing matches `src/routing.ts:26-36`, and review after a repair is B only (`requiredSlots`).
  - watch-issues has a 7-day expiry and steers once per seat (`skills/watch-issues/SKILL.md:16,42`).
  - broadcast goes to seat B after a command-run merge (`src/next.ts:1084`).
- checks.md: all 16 quoted refusal strings were found literally in `src/verify.ts`, `src/run-check.ts`, `src/guard.ts`, `src/phase.ts` or `src/evidence.ts` (grep run in this pass). The recovery citation rule matches `src/phase.ts:290`.
- No dates, no `docs/guide` links and no retired names (c6 and c4 checks).

## Tests

- T1 retargets the table check, and the dispatcher parse is unchanged. The deleted wording tests carry their reason (D7, report criterion 5).
- T2 widens discovery and adds `<img src>` parsing plus one new case. The HEAD fallback (D13) only answers paths missing on disk. A path missing from both disk and HEAD still fails, as the synthesis break showed. Verify runs on a committed fresh checkout, so the fallback cannot hide an uncommitted deletion at the gate.
- T3 widens the run-permit docs list and keeps `src/AREA.md`.
- Every criterion has a test or a named review proof. No test mocks the unit under test.

## Fixes

None.

## Nits

- N1. config.md describes `grounding.docs`, `surfaces` and `indexed_scopes` only as "optional lists". The concern: a reader cannot tell what they do. Deferred because no `src/` code reads them (U3 grep) and their meaning lives in the skills. It would become a Fix if a skill relies on these keys in a way a beginner must set correctly and the page then misleads them.
- N2. checks.md leaves out the main-red notification verify can send after a known-red base run. Deferred because the brief's checks.md list does not name it. It would become a Fix if an operator-facing refusal or action depends on that notification.

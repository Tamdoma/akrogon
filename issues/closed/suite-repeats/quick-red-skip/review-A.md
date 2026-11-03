# Review A — quick-red-skip

Base: 318cfda32d8ee6a569326ba7785df740cfd22039 (origin/main at review)
Reviewed head: bee1b542 (branch quick-red-skip, 5 commits)

## Evidence

- `check impl-verify: 0 .../implementation/check-impl-verify-1793540039109-782664.log` — all 54 `tests/verify.test.ts` tests green on HEAD.
- `check impl-slow-flaky: 0 .../implementation/check-impl-slow-flaky-1793540041896-796666.log` — slow-merge, flaky, receipt-gates green.
- `akrogon verify` on HEAD green — `check test: 0 .../implementation/check-test-1793540136718-803909.log` (1267 tests, 72 files), `check typecheck: 0 .../implementation/check-typecheck-1793540139061-803909.log`.
- `git log origin/main..HEAD` — `Test-Change:` trailers present for tests/verify.test.ts, tests/slow-merge.test.ts, tests/AREA.md.
- AREA.md path listing: every path named by the changed `src/AREA.md`/`tests/AREA.md` lines exists (checked from repo root).
- Diff read in full: `git diff 318cfda3..HEAD` (13 files).

## Fixes

### F1 — A `full` entry's `blocked` names the LAST red non-`full` check, not the first

Source: `src/verify.ts` `runOnce` — `if (code !== 0 && !isFull) blockedBy = { name: item.name, exit: code, log };` overwrites on every red non-`full` check, while the member rule keeps the first (`ran.find((item) => item.exit !== 0)`).

Realistic source: a real verify pass on a leaf with two failing quick checks and a `full` check — exactly the class of run this leaf targets (quick suite red while the full suite would waste time).

Consequence today: a `full` entry records `blocked: 'q2'` while a `merge_checks` member on the same row records `blocked: 'q1'`. The seat text this same diff adds says the named blocker "is fixed first"; the operator fixes q2, q1 is still red, and the full check stays blocked — the receipt misattributes the block and points at the wrong check. Design Q1 specifies `full` is recorded blocked "as merge members are", i.e. the same blocker convention (first red). One-line repair: `blockedBy ??= { ... }`.

Criterion/gap hit: design Q1's member-parity rule; criterion 1's recorded-`blocked` evidence; R2-adjacent consistency between sequential and member `blocked` names on one row.

### F2 — `implementation/report.md` missing

Source: `ls` of the leaf folder — `implementation/` holds briefs and check logs but no `report.md`.

Realistic source: the implement pass ended without writing it (implement A's own gap, confirmed by the phase having moved).

Consequence today: implement-issue requires `<leaf>/implementation/report.md` before handoff with changed files/reasons, commands run with results, base and committed head, limitations and unverified criteria; check.review reads it as input, and a `check.fix` re-check plus the refresh-record rules key off its recorded SHAs. Verification evidence for this leaf exists only as scattered check logs; the written judgment chain is absent.

Criterion/gap hit: the implement-issue handoff contract; material to correctness of verification (B's re-check and merge flow consume the report).

## Nits

### N1 — `skills/implement-issue/SKILL.md` `## Proof order` gained a stray blank line

The diff inserts a blank line between the intro sentence and the numbered list (@@ -41,+42). Cosmetic; reproduces as a one-line diff artifact. Deferred: zero behavioral consequence, touching it is churn. Would promote only if a linter or doc check is added that flags it.

## Verdict

fix

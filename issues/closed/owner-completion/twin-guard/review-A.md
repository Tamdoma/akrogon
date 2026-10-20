# Review A: twin-guard

Base: abfee125 · Reviewed head: efe9832b · Worktree clean at review start.

## Evidence

- `akrogon verify` on efe9832b: green (test 1058 pass/0 fail, typecheck, format; logs `implementation/check-test-…813506-321031.log`, `check-typecheck-…815750-321031.log`, `check-format-…646138-321031.log`). Prior run red only on the five twin-shaped fixtures, all repaired.
- Criterion proofs green on committed code: `check twin-slug-refusal: 0` (…230382-3548996), `twin-all-refusal: 0` (…244179-3586563), `twin-merge-queue: 0` (…245231-3603178), `twin-conflict-forms: 0` (…247533-3628861), `twin-closed-dispatch: 0` (…248573-3631606); all shown red pre-code in plan.md's red record.
- Diff read end to end against plan D1–D6 and the locked design: predicate shape, twin-first ordering in `blockDetail`/`eligibility`/`dispatchLeaf`, report keyed by open owner folder, no `recordWait`, inventory unchanged, `completeOwner` throw kept. `tsc` clean; call-site signatures consistent.
- `Test-Change` trailers present on all three commits touching `tests/`.

## Judgment against criteria

- C1: `next <slug>` on a twin leaf → twin line on `twin.open`, `code` 1, no `Missing leaf` — proven; `--all` prints once per owner via `report` dedup on `${repo}/${twin.open}` — proven.
- C2: parked and empty-folder forms refuse — proven.
- C3: other-owner dispatch incl. `blocked-by` a merged twin leaf — proven by `['dep1','ok1']`.
- C4: twin merge leaf excluded via `eligibility`, other leaf takes the turn — proven by the `m2` merge prompt.
- C5: closed-path dispatch unaffected (`within(leafPath, openRoot)` false) — proven.
- Untested-but-correct secondary paths verified by reading: `dispatchMergeLeaf`/`sweep` with `picked=false` still reach the check (twin leaves are skipped, not `waiting`, everywhere); `phase` merge-turn gate refuses twins through `mergeQueue`; `completeOwner`'s destination throw remains reachable on already-merged leaves (`phase` path).

## Findings

### Fixes

- **F1 — `docs/guide/next.md` "When picked work cannot start" is now wrong about refusal order and completeness.** Source: a real operator action — `akrogon next <slug>` on a leaf under a recycled owner name (the exact #108 incident shape) now prints `Twin owner folder: <open> conflicts with <closed|parked>` before the `failed` reason. Consequence today: the doc's claim "Reasons come in order. A failed leaf needs phase recovery first." is false (twin precedes `failed`), and the enumerated reasons contain no twin entry, so an operator cannot look up this new error. Gap: the section is the guide's complete statement of picked-leaf refusal reasons; the diff adds a reason the doc must carry. Plan D7 wrongly anchored on the "valid state and satisfied dependencies" line instead of this section. Repair: add the twin reason first in the ordering paragraph, e.g. an open owner whose name also exists under `issues/closed` or `issues/parked` refuses every leaf beneath it before all other checks.

### Nits

- **N1 — a dangling symlink at `issues/closed/<name>` or `issues/parked/<name>` does not trigger the refusal** (`existsSync` follows links and returns false), so leaves dispatch and `completeOwner`'s `renameSync` later replaces the dangling link. Deferred: no realistic source — nothing writes symlinks under `issues/`; every producer (`completeOwner`, `park`, `phase`, chart handoff) writes directories, so reaching this needs manual filesystem surgery. Would promote if a real writer or observed incident produces such an entry.

## Verdict

`fix` — one doc Fix, no code defects found.

# Review A — failure-names

Base: `97e88038` · Reviewed head: `7001a46a` (4 commits over base, diff read whole; `git status` clean, receipt `verify leaf 7001a46a: green` on file).

## Evidence

- Diff `origin/main...HEAD` read whole: `src/flaky.ts` (names split, `(script)`/`(unnamed)` names, tuple-prefix wrapper drop, `(fail)`-stream suppression, `nomatch` plain-file fallback), three test files, five doc/skill files.
- Design conformance checked point by point: wrapper drop runs before `(fail)`-stream suppression (Q1 item 4); stream match is whole-chain tuple equality; `Signaled:` ignored; free text never names; `nomatch` fallback reads `resolve(repo.root, recorded)` only when a regular file — `readLog`, `locate`, `readLogAcross`, `akrogon log` untouched; `verifyRunSchema`/`runOnce`/`knownRedReceipt`/`newRedUnits` untouched (excluded to `stored-failure-names` as designed).
- Live data check: ran the `names` logic over framework's P2 log `dilutor-overlap/dilutor-rebalance/implementation/check-verify-1793306012300-1260164.log` (21k lines): yields `["(unnamed) test:emdash-kit","(script) test:variant-parity"]` — wrapper chains dropped, no `(script) test:emdash-kit`, exactly the design's expected output.
- Criterion proofs all on the reviewed head: `check proof-flaky: 0` (7/7), `check proof-verify: 0` (60/60), `check proof-docs: 0` (12/12). Planning reds recorded: `plan-red-flaky1b/2/4`, `plan-red-verify/2/3`, `plan-red-docs`, `plan-cond-flaky` — each matches a planned missing-behavior red.
- Criterion-by-criterion: C1 (script name, wrapper drop, mixed streams, same name under other wrapper) proven by the new fan-out test incl. `test:a`/`test:ab` tuple-prefix case and a bare `(fail)` on no stream. C2 proven (emdash-kit shape, bare `(unnamed)`, title holding ` | (fail) `). C3 proven by unchanged nameless-cover cases and the fan-out `Signaled:` exclusion. C4 proven (head `test:y` vs base `test:x` → `fail`, same-script → `pass`, nameless cover still passing). C5 proven (notice for `test:y` while `test:x` stays covered; repeat produces no third notice). C6 proven (flip names `alpha` from an outside-grammar file, `(log gone)` for a missing one, holder known-red pair judged from both logs). C7 proven (both texts restated, literals pinned, four gitlinks still 120000 — also verified `git ls-files -s`). C8 proven (all three docs state the name set; no remaining "only from `(fail)` lines" claim — grep sweep over docs/, skills/, src/ found no stale copy).
- Commit hygiene: tests committed before product (`bbfb0213` then `dd190d4f`); trailer rule satisfied on all test-file commits; report maps criteria to commands on the right head; `files.md` prettier table reflow reverted — diff there is the intended one line.
- AREA.md paths in diff: every added path pre-exists (`src/flaky.ts`, `src/evidence.ts` names); verified by listing.

## Findings

### Nits

- **N1** — `flips`'s doc comment still says "one flip per failed test" while names now include scripts; and local `leaf` inside `names()` shadows the repo's leaf term for a moment's confusion. Cosmetic only: no test pins the comment, the rename is a one-word edit, and no behavior or doc depends on either. Would promote to a Fix only if a reader reports actual misreading in a real pass.
- **N2** — A `(fail)` title literally containing ` | Exited with code <n>` would mint a `(script)` name from title text. Bun titles are repo content, a repo could write such a title, but there is no observed instance in framework's 254 red logs (chart R2) and the design's trust boundary accepts Bun-line shapes as names; a fabricated-title check would contradict Q1/3a. Deferred as inherent to the locked design.

### Fixes

None.

## Verdict

`ready`

## Operator actions

None.

## Grant/count lines

`check.review` launches no covered operation; nothing paid, no env (`env_names: []` on status).

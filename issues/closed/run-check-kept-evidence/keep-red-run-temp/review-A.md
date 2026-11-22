# Review A: keep-red-run-temp

Base: 5daa962e1c4ef03a80f0209a5c5520145f57ab61
Reviewed head: 96589baf0a7cf4fa82826b11947dc4b71d2afbf7

## Evidence

- Diff reviewed: `git diff 5daa962e..96589baf` — src/run-check.ts, src/reconcile.ts, docs/reference/checks.md, src/AREA.md, three test files.
- `akrogon verify` green receipt on head 96589baf (format, typecheck, test all 0; test log `check-test-1795174359560-3870405.log`, 1230 pass).
- Criterion proofs in report.md: c1-run-check-proofs 0, c2-verify-proof 0, c3-c4-reconcile-proofs 0 — all run after the last change to each file's tests (test corrections 5c983c83 preceded every green proof; the later commit 96589baf is prettier reflow only, and the suite re-ran the retitled verify test green on head).
- Code read: `withAdmission` (src/admission.ts:229) — no early return that bypasses the flag path except refusals that throw; `refusePublish` (src/run-check.ts:347-354) sets `refused = true`, writes `refusal.json`, removes `.owner`, throws — the root is kept with `refusal.json` under the `!refused` gate.
- AREA.md path listing: all named files exist (src/run-check.ts, src/reconcile.ts, src/admission.ts, src/status.ts, src/leftovers.ts, src/verify.ts, docs/reference/checks.md, src/AREA.md). src/AREA.md is 39 lines, under the 40-line cap.

## Findings

### Fixes

- F1 — `docs/reference/checks.md:50` and `src/AREA.md:5` say "zero exits, publish refusals and thrown errors remove it as before". Publish refusals do not remove the run root: `refusePublish` keeps it with `refusal.json` and the captured output — that is today's published-refusal behavior the same sentence's feature is built next to, and criterion 1 pins it (a publish-refused run keeps its root with `refusal.json` and no `.akrogon-kept`). Source: A's own implementation writing doc lines that contradict the adjacent refusal semantics it preserved (and its own green refused-run test asserting the kept root). Consequence today: a reader debugging a refused run is told the root and its `refusal.json` are deleted, so the documented evidence path is denied by the doc itself; the same misstatement is duplicated in src/AREA.md. Criterion 6 (docs state the new lifetime) — the doc is wrong about the adjacent lifetime it names in the same clause. Fix: state that publish refusals keep the run root with `refusal.json` under the existing refusal rule (no marker), zero exits and thrown errors remove it.

### Nits

None.

## Checks against the criteria

- C1: marker on nonzero exit, refused root unmarked — code and tests correct; doc clause is F1.
- C2: verify inherits; green root removed, red marked — proven.
- C3: reconcile skips marked root in the scratch loop before `.owner` reads and in `ownerKeeps` before its `.owner` compute with no recursion; silent, no kept entry — matches design verbatim order (marker check after `refusal.json` check).
- C4: unmarked dead/live `.owner` paths untouched.
- C5: `existsSync` guard; a self-deleted TMPDIR keeps exit, no marker, no root.
- C6: doc lines exist but carry F1's misstatement.
- No model-choice steps, no test mocks of the unit under test, no missing-path pointers, no report gaps material to correctness. Count audit: no grants, no paid launches — the leaf's `check-*.log` files are all free local runs.

## Verdict

`fix` — one doc correction (F1).

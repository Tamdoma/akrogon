# Review A: main-red-cover

Base `4f5e3fd2`, reviewed head `a420e39c`. Diff: `src/verify.ts`, `src/land.ts`, `docs/reference/{checks,commands,files}.md`, three test files.

## Evidence

- Judged the diff against plan D1–D6, brief done-criteria 1–4 and the design's exclusions. Semantics match the locked Taken 7 text: named-title units only, `compares` base at or before merge-base (`isAncestor` incl. equal), resolution by later-ended landed run green or red-naming-only-other-titles, nameless landed resolves nothing, leaf scope untouched, `knownRedReceipt` and `verify --known-red` byte-identical.
- `mainRedCover` reads stored `failures` first, `failedTests` second; `blocked` never contributes; `reused` head entries contribute units (per D3); `reused` landed entries never resolve. `sameCommands(run.commands, verifyCommands(config,'merge'))` scopes the head set.
- Report vs plan: every criterion proof ran the named `bun test -t` command through `akrogon run-check`; green runs postdate the last test edits (`fe4b32c7`, `a420e39c` were before the proof runs). Four deliberate breaks each red then reverted; `break-onmain` staying green exposed a blind case, fixed in `a420e39c` and re-proven red in `break-onmain2`.
- `akrogon verify` on `a420e39c`: pass `abf95ef1` red on `tests/hc-start.test.ts` `slot B starts under the live A` — file untouched by the diff; retry `test-retry2` green on all 1268 → `inconsistent`; final `reuse receipt d56915b4` green on the reviewed head. Both logs kept under `implementation/`; the killed first retry `f6b59338` has `cleared-f6b59338-…​.md` beside its capture pair.
- Count audit: 42 `check_start` rows for this leaf in `issues/timings.jsonl`; 41 `check-*.log` plus one abandoned `capture-` pair (the killed run) under `implementation/`. Consistent.
- AREA.md rule run over the diff: `src/AREA.md` and `tests/AREA.md` name `src/land.ts`, `src/verify.ts`, the three test files; all exist. Finding below.
- Doc pages describing the changed behavior (`checks.md`, `commands.md`, `files.md`) were updated and match the code. `knownRedReceipt` unchanged → the direct route's two-log judgment untouched, as locked.

## Findings

### Fixes

- **F1 — `src/AREA.md` carries two claims this diff falsifies.** Realistic source: the leaf `merge-red-exit` (same chart, owns every uncovered red) and any seat landing in the checkout; AREA.md is the canonical per-file contract those seats read, and `docs/reference-index.md` routes doc grounding through it. Consequence today: a reader of the `src/land.ts` line learns "a red verify … hands the attempt to B with `wake=`" with no exception — a covered main-red head now lands instead; and the `src/verify.ts` line states `requireGreenReceipt` accepts only the all-green or linked-base paths with "scope is never consulted" — merge scope is now consulted via `mainRedCover`. Gap hit: the plan's documentation checklist missed `src/AREA.md`; the diff changed the contract AREA.md states for both files. Repair: extend the `land.ts` line's hand-off clause and the `requireGreenReceipt` sentence with the merge-scope cover. `tests/AREA.md` lines for `verify.test.ts`/`green-merge.test.ts` stay true (non-exhaustive), no change needed.

### Nits

- **N1 — Nameless-marker set duplicated in `named()` (verify.ts) vs `names()` (flaky.ts).** Concern: a new nameless form added to `names()` later must also be added to `named()`; missing it classifies a nameless unit as coverable. Deferred because the misclassification is conservative (uncoverable → ordinary red path), the forms are locked by the brief, and no realistic new form exists today. Promoting evidence: a `names()` change that adds a form without touching `named()`.
- **N2 — Comment above `newRedUnits` still describes the old exit-0-only resolver.** "a red observation R resolves when a green observation lands at or after R's sha" omits the new resolve-on-red-without-unit case that `resolvedOnMain` now implements. Deferred: the helper's own comment is correct and the consequence is minor reader confusion, not wrong behavior.

### Operator actions

None.

## Verdict

`fix` — one documentation defect (F1), repairable by B.

# Plan: known-red-merge

Debate off (`debate: "no"`); synthesized from the brief and the locked design. `known-red-leaf` and `base-run` are landed on this branch (`AKROGON_BASE` 2756bd0 already contains `src/compare.ts`, `src/red-record.ts`, `src/base-run.ts`); `test-proof-rules` text is present in the cited skill lines.

## Decisions

- **D1 — `--compare` reaches `merged --check` only.** `phaseCommand`'s merge refusal (`'--compare' is not valid during merge`, phase.ts today ~:975) narrows to non-`merged` requests and to `merged` without `--check`; any other merge-phase `--compare` is refused. `batchCheck` gains a `compareFiles` parameter and, after `transition(checkOnly)` succeeds, validates each record under the merge binding (D3) before stamping.
- **D2 — `batch.comparisons`.** `batchSchema` gains `comparisons: z.array(z.string()).optional()`, set by `batchCheck` to the accepted `--compare` file list (absent list ⇒ absent field; an earlier value is replaced). It is dropped at every restack write that decides `reuse`/`rerun` or degrades the batch (the final applied write, both dirty-holder writes, the late-dirty write, the holder-conflict solo write, the member-conflict write), and it survives the refused-push clear of `tested_top` so `finishPush`'s landed path can still resolve green records. It goes whenever the whole batch record clears.
- **D3 — Merge binding in `validateComparisons`.** Signature gains `slot` already present; add `merge?: { attempt: string; built_on: string }`. Under merge: `record.attempt === merge.attempt` (`recordCore` gains optional `attempt: nonBlank`), `counterpart_revision === merge.built_on` (instead of `base(repo, worktree)`), and the base-run candidate filter additionally requires `run.attempt === merge.attempt`; `run.start > state.prompted_at.B`, matching base, command and log, and `end`+`exit` recorded — all as today. `leaf_revision === head` unchanged (non-solo `head` is `record.top` by the existing guard; solo head is the worktree HEAD). The `new`/`unverified`/`own_criterion` refusal gains `merge !== undefined` since `requested === 'merged'`, not `'merge'`.
- **D4 — `green` record state.** `comparisonSchema` gains a third variant: `state: 'green'` with `recordCore` minus `retry` (a green record carries no retry and no counterpart), `run.complete` restricted to `z.literal(true)`, and `units[]` of `{runner, file, name, leaf: {outcome: pass|fail|missing, log}}` (no retry/base/verdict/own_criterion), `min(1)`. Validation: logs exist, `leaf_revision === head`, `attempt === merge.attempt`; no verdict gate (no verdict field) and no base-run requirement. Absence of a unit outcome is not a pass — B records only real outcomes.
- **D5 — Red record at `--check`.** After the save stamping `tested_top`/`tested_main`/`comparisons`, `batchCheck` runs the same `recordComparisons` per-file loop the leaf path uses (resolve-then-apply, notice once per new entry, warn on notice failure), inside the global lock `phaseCommand` already holds. `resolveComparison` resolves a `built_on`-side pass under the existing ancestry rule; `applyComparison` opens entries for `known-red` units. `inconsistent` and `green` records apply nothing.
- **D6 — Green resolve on landing.** `red-record.ts` gains `resolveGreen(repo, file, record, landed)`: returns early when `record.state !== 'green'` or `record.leaf_revision !== landed` (a `reuse` push lands a different sha ⇒ resolves nothing); otherwise each unit with `leaf.outcome === 'pass'` resolves the active entry of matching identity+provenance, appending `resolved` with `resolving: landed`. `compare.ts` exports the record parser (exported `parseComparison`); a helper in `phase.ts` iterates `batch.comparisons`, parsing each and skipping with a `console.warn` on a missing or unparseable file — landing never fails on a record artifact. Called inside the existing lock in all three landed paths: `batchPush` after a direct push (head), `finishPush`'s ancestor path (pending.candidate), `reconcileBatch`'s landed block (batch.candidate, covers the failed-holder branch too).
- **D7 — Restack known-red gate.** `reuse` additionally requires that no accepted record in `batch.comparisons` holds a `known-red` unit: parse each file (missing/unparseable ⇒ treat as red-bearing: rerun; a stamped record's file vanishing means its evidence is gone, so rerun is the safe decision). Green-only or no records keeps today's `reuse`. The comparisons field is then dropped on both decisions.
- **D8 — Hold retired.** `src/hold.ts` is deleted; `mergeHolder` is replaced by `mergeQueue(...)[0]` at its three call sites (phase.ts authorization, next.ts dispatchLeaf gate, next.ts mergeTurn). The `heldBefore`/`heldNow`/`fixHeld` blocks in `mergeTurn`, the `--red-on-base` ending branch in `phaseCommand`, `writeHeld`, the status `held:` line/board mark and `readHeld`, the unpause hold print, `hold-fix`/`unhold` cases, and the `import { type Hold }` all go. `src/akrogon.ts` drops the two verbs from the usage line and throws the pointer error for either verb before `parseArgs` (D9). `attemptOutcomeSchema` keeps `'held'` so history parses.
- **D9 — Retired calls.** `phase` keeps `red-on-base` and `command` in the parser; `phaseCommand` throws `akrogon phase --red-on-base/--command is retired: the known-red rule in skills/merge-issue/SKILL.md replaces them` whenever either is present, before any other flag validation and without state change. `akrogon.ts` throws the same pointer for `verb ∈ {unhold, hold-fix}` before argument parsing so every stale invocation fails identically. README drops both rows; `command-reference` contracts drop both entries; the `phase` contract drops `[--red-on-base <sha> --command <command>]` (the flags stay parseable but are not advertised).
- **D10 — mergeHolder keeps queue order.** With `held` gone, `mergeQueue`'s batch-first sort is the whole turn rule; pause, normal queue order and `merge_stamp` ties are untouched.
- **D11 — Skill text.** `skills/merge-issue/SKILL.md`: :43 gains `--compare <file>...` and the green-record clause; :47's `reuse` gains "no accepted comparison record holds a known-red unit"; :55's fix-forward sentence is replaced by the known-red rule (a broken base takes the comparison path; a wrong expectation in a batch leaf's own criteria goes to `--culprit`; B corrects no expectation at merge); :65 gains the `--compare` clause for the solo form; :73 is rewritten as retry once → `akrogon base-run --base <built_on> --attempt <id> -- <command>` → per-unit comparison record(s) → `merged --check --compare` when every failing unit is `known-red` → otherwise the existing culprit/split endings — no hold; a sentence adds that retired merge hold calls fail pointing at this rule, without naming the retired spellings (so the sweep stays clean). `docs/guide/merge.md:29` rewritten to match; `docs/guide/next.md:119` hold paragraph becomes a pause-only line; `docs/guide/cheat.md:110-116` drops the unhold row; `docs/guide/files.md` marks the `held` outcome historical; README :134 merges the comparison sentence in and drops `--red-on-base`; :144-145 rows removed; `src/AREA.md:32` replaced with a line naming merge comparisons, the green resolve and restack rerun; `tests/AREA.md` gains the two new test files.
- **D12 — Limit kept.** A new failure hidden inside an already-red unit can slip through when output and review cannot expose it (design limit), and a green resolve lost to a tampered/missing record file delays resolution rather than failing the landing.

## Read-first

- `src/phase.ts` (`transition` :272-355 for the compare gate and `recordComparisons` :208-262, `batchCheck` :564-611, `batchPush` :622-680, `restack` :689-890, `finishPush` :893-950, `phaseCommand` :953-1117 incl. the `--compare` merge refusal and `--red-on-base` branch)
- `src/next.ts` (`reconcileBatch` :950-1080 landed block, `mergeTurn` :1081-1330 hold blocks at :1123-1165, `dispatchLeaf` merge gate :784)
- `src/compare.ts` (schema and `validateComparisons`; verdict gate and base-run filter)
- `src/red-record.ts` (`applyComparison`, `resolveComparison`, `activeRed`, `appendNotice`)
- `src/state.ts` (`batchSchema` :46-69, `withLock` :211), `src/base-run.ts` (`callerLeaf`/`attempt`/`pickSlot`), `src/hold.ts` (all of it — being deleted), `src/attempts.ts` (outcome enum)
- `src/akrogon.ts` (options map and switch), `src/status.ts` (:351-390 hold lines), `src/turn.ts` (`mergeQueue` :81)
- `tests/batch-merge.test.ts` (fixtures and the refused-push/reuse cases), `tests/compare.test.ts` (record builder, `baseRunLine`, `redRecords`, `openedEntry`), `tests/hold.test.ts` (deleted; `mergeTurn` drive pattern), `tests/merge-attempts.test.ts` (`phaseBody`/`spawn`), `tests/pause-status.test.ts` (hold cases removed), `tests/red-docs.test.ts`, `tests/command-reference.test.ts`
- `skills/merge-issue/SKILL.md` (:41-75), `docs/guide/merge.md`, `docs/guide/next.md:119`, `docs/guide/cheat.md:110`, `docs/guide/files.md:67-74`, `README.md` command table
- `learnings/history/2026-10-10-red-main-hold-stale-clear.md` (revalidate inside the lock — all red-record writes stay inside the caller's lock)

## Interfaces

- `compare.ts`: `parseComparison(file): Promise<Comparison>` (exported); `validateComparisons(repo, leaf, state, slot, worktree, files, requested, merge?)` where `merge: { attempt: string; built_on: string } | undefined`; `comparisonSchema` + `Comparison` type gain the `green` variant; `recordCore.attempt?: nonBlank`.
- `red-record.ts`: `resolveGreen(repo, file, record, landed): Promise<void>`.
- `phase.ts`: `batchCheck(..., compareFiles)`; `greenResolutions(repo, comparisons, landed)` helper; `recordComparisons` reused; `phaseCommand` throws the retired-flag pointer and routes `compareFiles` into `batchCheck`.
- `state.ts`: `batchSchema.comparisons?: string[]`.
- `next.ts`: `reconcileBatch` landed block calls the green resolve; `mergeHolder` call sites become `mergeQueue(...)[0]`; hold imports and blocks removed.

## Waves

### Wave 1
- **U1 — compare and red-record.** Owns `src/compare.ts` (green variant, merge binding, exported parser), `src/red-record.ts` (`resolveGreen`), `src/state.ts` (`comparisons` field). No dependency; lands first so U2 imports compile.

### Wave 2
- **U2 — merge wiring and hold removal.** Owns `src/phase.ts`, `src/next.ts`, `src/akrogon.ts`, `src/status.ts`, `src/attempts.ts` (unchanged — enum keeps `'held'`; no edit expected), `src/hold.ts` (delete), `src/AREA.md`. Depends on U1.
- **U3 — docs and tests sweep.** Owns `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `docs/guide/files.md`, `README.md`, `tests/AREA.md`, `tests/hold.test.ts` (delete), `tests/pause-status.test.ts` (hold cases out), `tests/merge-attempts.test.ts` (held-PSI case converted to a `red` line), `tests/command-reference.test.ts` (contracts), `tests/red-docs.test.ts` (merge-issue contracts). Disjoint from U2; shares wave 2. Shared test resource: none — each edits different files; both run the same suite at verification.

Affected docs: `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `docs/guide/files.md`, `README.md`, `src/AREA.md`, `tests/AREA.md`. No other doc touched (`docs/reference-index.md`, `skills/AREA.md` hold no hold-rule text; `docs/guide/phases.md` has no merge-hold text).

## Criterion proof map

| # | Criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | known-red merge stamps `--check` and pushes through | `bun test tests/merge-compare.test.ts` | push refused, batch cleared, hold written, check.fix taken | minutes | phase/compare change |
| 2 | merge-binding and verdict refusals naming field or file | `bun test tests/merge-compare.test.ts -t 'refus'` | silent accept, wrong counterpart, missing attempt/base-run freshness | seconds | D3 rule change |
| 3 | stack-caused failure keeps culprit/split | existing `bun test tests/culprit.test.ts tests/batch-merge.test.ts -t 'culprit|split'` + criterion-2 `new`/`unverified`/`own_criterion` refusals | regression in today's path | minutes | phase.ts endings change |
| 4 | add/notice at merge, `built_on` resolve at `--check`, green resolve at landing, reuse resolves nothing | `bun test tests/merge-compare.test.ts -t 'entry|green|resolves|resolve'` | lost entry, early resolve, resolve on reuse | minutes | red-record/landing change |
| 5 | restack prints rerun on known-red, reuse on green-only; records dropped both ways | `bun test tests/merge-compare.test.ts -t 'restack|reuse|rerun'` | reuse taken with red record, stale records kept | minutes | restack change |
| 6 | nothing reads/writes `held.yaml`; legacy file inert | `bun test tests/hold-retired.test.ts` | reintroduced reader, behavior difference | seconds | any hold-adjacent change |
| 7 | retired calls fail with the pointer; `held` outcome parses | `bun test tests/hold-retired.test.ts` | flag silently accepted, wrong error, history unparseable | seconds | akrogon/phase change |
| 8 | skill carries the new contracts and drops the hold ending | `bun test tests/red-docs.test.ts` + semantic seat review | stale hold rule, missing `--compare`/green text | seconds | skill text change |
| 9 | sweep finds no hold or merge-red-on-base surface | `bun test tests/hold-retired.test.ts -t 'sweep'` + sweep report below | leftover token | seconds | docs/src change |

`checks` (format, typecheck, test, test_changed) also run per repo config; the tests above are the leaf's own proofs. No criterion needs `merge_checks` or a live run; no new proof machinery.

### Sweep report (criterion 9)
Hold surface found by reading `skills/`, `docs/`, `README.md`, `src/AREA.md`: `skills/merge-issue/SKILL.md` (:43 "base-red hold" pointer, :47 reuse line, :55 fix-forward clause, :73 hold ending), `docs/guide/merge.md:29`, `docs/guide/next.md:119`, `docs/guide/cheat.md:110-116`, `docs/guide/files.md:67,74` (`held` outcome listed as written), `README.md:134` (`--red-on-base` clause), :144-145 (rows). Out-of-scope hits kept and listed: `docs/guide/chart.md:46`, `docs/guide/files.md:36` ("hold" as ordinary prose), `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/questions.md`/`shapes.md` ("holds"/"held" as ordinary prose), `skills/check-issue/SKILL.md:27` ("unheld" prose), `skills/seed-issue/SKILL.md:86` ("hold" prose), `src/attempts.ts` `'held'` enum (kept by criterion 7), `learnings/` history (record of what happened). `tests/` files other than `tests/AREA.md` are out of the sweep's named scope; the hold test files are removed/edited by U3 anyway.

## Committed tests (red-first, this planning pass)

- `tests/merge-compare.test.ts` (new): merge `--check --compare` happy path with a real `akrogon base-run --attempt`, push lands without a hold, entries+notice; per-refusal `test.each` for attempt, leaf_revision, counterpart, base-run binding (no line, attemptless line, stale start, wrong command, unfinished), `new`/`unverified`/`own_criterion`; `--compare` on `merged` without `--check` and on `check.fix` refused; `built_on`-side resolve and non-ancestor stay-active; green resolve on a direct push, after a refused-then-landed push (`git` wrapper), in the reconcile pass, and none on `reuse`; restack rerun/reuse and comparison-drop cases.
- `tests/hold-retired.test.ts` (new): retired verb and flag refusals name `skills/merge-issue/SKILL.md`; legacy `held.yaml` is inert across `status`, `pause`/`unpause`, `next` dispatch and a `mergeTurn` (no `held` output, file byte-identical, merge proceeds); `held` attempt line still parses via `attemptRecordSchema` and `status` still runs; source sweep asserts no `src` reader/writer of `held.yaml` and no hold tokens in `skills/`, `docs/`, `README.md`, `src/AREA.md`, `tests/AREA.md`.
- `tests/pause-status.test.ts` (edited): the four hold cases removed; `hold()` helper removed.
- `tests/merge-attempts.test.ts` (edited): the `held` PSI case converted to assert a `red` line under the new flag-free signature.
- `tests/command-reference.test.ts` (edited): contracts drop `unhold`/`hold-fix` and the `--red-on-base` clause.
- `tests/red-docs.test.ts` (edited): merge-issue contract assertions added.

Commit trailers on the test commit: `Test-Change: tests/pause-status.test.ts retired hold assertions removed for the known-red-merge hold retirement`, `Test-Change: tests/merge-attempts.test.ts held-PSI case converted to a red line for the hold retirement`, `Test-Change: tests/command-reference.test.ts contract updated for retired verbs and flags`, `Test-Change: tests/red-docs.test.ts merge-issue contract assertions added`.

Recorded intended reds (full suite `bun test --timeout=30000`, 767 pass / 31 fail, every failure in the planned files):

- C1/C4 (`tests/merge-compare.test.ts` happy paths): `a compared record with every unit known-red stamps --check, opens entries, and the push lands with no hold`, the inconsistent stamp, the `built_on`-side resolve, the three green-resolve paths and the solo binding all fail — `merged --check --compare` exits `'--compare' is not valid during merge` from `src/phase.ts`, and the red-record/status assertions never see the events.
- C2 (`tests/merge-compare.test.ts -t 'refuses'`): all 12 refusal cases fail because the generic merge refusal fires instead of the named field/file refusal; each asserts `stderr` does not contain `not valid during merge`, so the merge binding must land to turn green.
- C5 (restack cases): `rerun` case fails at the `merged` call's absent `comparisons` field (stamped record never accepted); `reuse` case fails the same way.
- C6/C7 (`tests/hold-retired.test.ts`): `unhold` and `hold-fix` exit 0 instead of failing with the pointer; the retired-flag case stderr lacks `skills/merge-issue/SKILL.md`; the inertness case fails with `status` printing `repo (held fix hold)`; the src sweep fails on `src/akrogon.ts` matching `/heldFor/`; the doc sweep fails on `skills/merge-issue/SKILL.md` matching `/--red-on-base/`.
- C8 (`tests/red-docs.test.ts`): `the merge skill carries the merge comparison, green-record and batch-base contracts` fails — `--compare` absent from the skill text.
- Command contract (`tests/command-reference.test.ts`): `README covers every dispatched command` fails — contracts no longer match the README rows (`unhold`/`hold-fix` rows present, `--red-on-base` clause present); `escaped alternatives` fails the same way.
- Deletion/green-by-design cases recorded green already: `--compare on merged without --check and on check.fix is refused` and `a held outcome still parses` pass today and stay green.

`bun run typecheck` currently fails on `batch.comparisons` reads in `tests/merge-compare.test.ts` (6 errors) — intended, the field lands in U1. `bun run format` may rewrite pre-existing drift; leave it for implement.

### Implementation notes

- `check.fix` with carried members stays `split` (the memberless case appends `red`); the converted `merge-attempts` case uses a memberless holder so its line is `red`.
- A `known-red` unit whose `built_on` outcome is `pass` resolves the older entry and then re-adds a fresh one (resolve-then-apply, the known-red-leaf rule); the merge-compare resolve test asserts both events.

## Implementation notes

_(filled during implement)_

## Notes

- Brief/design: no conflicts. Design line numbers drifted a few lines from the cited code; the anchored functions are the ones listed above.
- `prompted_at.B` is required for the merge base-run freshness check; merge dispatch stamps it (dispatchSlot `recordDelivery`), and a merge leaf without it correctly refuses merge comparisons.
- `mergeHolder` has three call sites; all become `mergeQueue(...)[0]` — `phase.ts:989` authorization, `next.ts:785` dispatch gate, `next.ts:1086` turn pick.
- The green record is deferred evidence: stored as paths on `batch.comparisons`, re-parsed at landing. A missing/unparseable file warns and skips rather than failing a landed push.
- No credentials named by the design; `akrogon status` `Missing:` lines are empty.
- A wrong-expectation-in-own-criteria unit goes to `--culprit` (that batch leaf's A corrects it under `test-proof-rules`); merge B corrects none.
- No restart machinery: a merge seat mid-pass on old text hits the retired-call pointer error; every later merge prompt loads the new skill (held disagreement B F9 noted, design holds).
- No slow runs beyond the suite's normal real-git tests; no restart boundaries needed.

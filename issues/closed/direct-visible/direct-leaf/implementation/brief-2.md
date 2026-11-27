# Brief 2 — U2: phase routing (slots, repair-merge rule, broadcast gate, timing gaps)

## 1. Goal

Implement plan decisions D6, D7, D8 (product half), D12 of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (read it first — those decisions plus Criterion 7/5 constructions and the Implementation constraints section). Outcome: direct leaves route check.review to B alone at every round, check.repair/check.fix/implement/merge/failed to A; the direct `check.repair → merge` move is accepted only unedited after a red land exit; `commandMerged` records broadcast only when the repo configures a broadcast target; `visitGaps` suppresses prompt/seat_done gaps for direct leaves while keeping check_end pairing. `tests/direct-phases.test.ts` passes unmodified and the gap half of `tests/direct-timing.test.ts` passes (its start-time half belongs to another unit — do not touch src/status.ts).

## 2. Numbered acceptance criteria

1. `bun test tests/direct-phases.test.ts --timeout=120000` — all 6 tests pass unmodified.
2. `bun test tests/timing-report.test.ts --timeout=120000` — passes unmodified (lifecycle behavior byte-identical).
3. `bun test tests/direct-timing.test.ts --timeout=120000` — the visitGaps test passes; the other two tests in that file depend on src/status.ts (NOT your unit) and may stay red in your worktree — record them as such in your report, they are not your mismatch.
4. `bun test tests/routing*.test.ts tests/phase*.test.ts` (whatever exists matching those globs) — pass unmodified.
5. `bun run typecheck` exits 0.
6. Lifecycle behavior unchanged: no existing test regressions in the files you ran.

A worker writes and edits no test: a planned test that is wrong or red once your code is correct is a mismatch returned to A, never a test fix.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — D6, D7, D8, D12, criterion 7/5 constructions.
- `src/routing.ts` — `requiredSlots`/`historicalSlots`.
- `src/phase.ts` — the two `requiredSlots` call sites, the `check.repair → merge` guard (~L512), `commandMerged`/`ownerCompletion`/`completion`.
- `src/timing-report.ts` — `visitGaps` (~L166-199), its callers (~L229/285) and how the leaf inventory is available there.
- `src/next.ts` — `requiredSlots` caller at ~L1087 (thread the flag; minimal diff — wave-2 sibling owns the rest of next.ts, so touch ONLY the single call-site line).
- `src/status.ts` — `requiredSlots` caller in leafJson `waits_on` (~L622): same, thread the flag only; nothing else in status.ts. NOTE: wave-2 sibling U4 owns status.ts surface changes; coordinate by keeping your edit to exactly the waits_on call.
- `tests/direct-phases.test.ts` — the executable contract; read fully.
- `tests/direct-timing.test.ts` — read the gaps test's expectations.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `src/routing.ts`, `src/phase.ts`, `src/timing-report.ts`, plus single-line threads in `src/next.ts` (L~1087) and `src/status.ts` (L~622 waits_on). No other files.

Must land first: wave 1 (U1's schema/verbs — your worktree is created after it lands). Creation commit: filled by A below.

Binding facts copied from the plan:

- `requiredSlots(phase, rounds, direct = false)` and `historicalSlots(phase, rounds, direct = false)` gain a defaulted third param. Direct mapping: implement/check.fix/check.repair/merge/failed → ['A']; check.review → ['B'] at EVERY round; plan.*/closed unchanged. Lifecycle output byte-identical when direct is false/absent.
- Every caller holding leaf state passes `state.direct === true`: phase.ts both sites, next.ts L~1087, status.ts waits_on, timing-report.ts historicalSlots call inside visitGaps.
- `check.repair → merge` (src/phase.ts ~L512): for direct leaves accepted ONLY when `merge_exit.reason === 'red'` AND `merge_exit.top` equals the leaf branch's current head; every other direct shape refuses. Lifecycle exactly as today. One extended condition in the existing guard, not a second call site.
- `commandMerged`: records `broadcast` only when `repo.config.broadcast` is present AND its `discord.webhook_env` list is non-empty — configuration presence only, never process.env evaluation. The completed owner is non-null for every leaf kind. IMPORTANT: existing broadcast-positive tests (green-merge, batch-dispatch, session-routing) currently configure no target — they are updated by ANOTHER unit in wave 3, not you; in your worktree they will go red once you add the gate. That is expected and recorded in the plan (D8). Do not edit them; do not weaken the gate. Verify instead: `tests/green-merge.test.ts:185`-style negative (broadcast undefined without config) passes.
- `visitGaps`: direct visits suppress 'prompt' gaps and the round-0 check.review 'seat_done' gap by explicit kind filter. check_end pairing unchanged. Thread `direct` from the leaf inventory lookup — read how visitGaps' callers obtain leaf states (open or closed).
- `state.direct` is `boolean | undefined` after schema parse; treat `=== true` as the only true form.

## 5. Do-not, reasons and exceptions

- Do not edit any test file: the tests are the criterion contract. Exception: none for this unit.
- Do not touch `src/status.ts` beyond the one waits_on thread and `src/next.ts` beyond the one requiredSlots thread: wave siblings own those files; overlapping edits break cherry-picks. Exception: none.
- Do not weaken the broadcast gate or add env-value evaluation: the plan pins config-presence semantics with a verbatim design citation. No exception.
- Never run any `git stash` subcommand: every worktree shares one stash. Replacement: commit as WIP and, before returning, `git reset --soft <creation commit>` and make the unit's single returned commit.
- Do not kill processes by pattern.

## 6. Ordered steps

1. Read the plan sections and both test files fully.
2. `src/routing.ts`: extend both functions. Verify no behavioral change for direct=false with existing tests.
3. Thread the flag through the five call sites.
4. `src/phase.ts`: repair→merge direct condition; commandMerged gate.
5. `src/timing-report.ts`: direct threading + kind suppression.
6. Run section-7 commands; iterate until green or mismatch.
7. Squash per reset rule; single commit `feat: direct leaf phase routing` (or similar).

Advisory size: about 5 files, small diffs, under 40 turns.

## 7. Commands

- `bun test tests/direct-phases.test.ts --timeout=120000`
- `bun test tests/timing-report.test.ts --timeout=120000`
- `bun test tests/direct-timing.test.ts --timeout=120000` (gaps test green; record others)
- `bun test tests/routing*.test.ts tests/phase*.test.ts --timeout=120000` (glob-expand existing only)
- `bun run typecheck`

Install first if node_modules absent: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify`. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold in your worktree and the single squashed commit exists. Report the four lines plus commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): e01743a6 — VERIFY with `git log --oneline -1` at start and use what is there.

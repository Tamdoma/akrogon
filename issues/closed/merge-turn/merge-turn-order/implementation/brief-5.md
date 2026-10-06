# Brief: merge-turn-order unit U5 — phase.test.ts for stamp, guard, committed-move signal

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u5

## 1. Goal

Cover plan criteria 4, 5 (command half), the `merge_stamp` write (criterion 8's stamp side) and rework existing multi-leaf `merge` fixtures that violate the one-holder rule (plan D10).

The code under test (already landed): `commitMove` stamps `merge_stamp` on moves into `merge`; `phaseCommand` refuses `merged` (with/without `--check`) and `check.fix` for a `merge`-phase leaf that is not the holder, naming the holder, before worktree guards; `failed` is never refused; post-commit failures throw `MoveCommittedError`.

## 2. Acceptance criteria

New cases in `tests/phase.test.ts` (extend the file, don't create a new one):

- AC1 With two eligible `merge` leaves `aa` (earlier) and `bb`: `phase bb merged`, `phase bb merged --check` and `phase bb check.fix` all exit non-zero and name `aa` in stderr. `phase bb failed --reason x` succeeds. Holder is decided by `merge_stamp` when present, else slug order with no stamps.
- AC2 `phase aa merged` for the holder succeeds (leaf without worktree is fine — existing tests show worktree guards are skipped when `state.worktree` is undefined).
- AC3 The refusal precedes worktree guards: give `bb` `worktree: '<a missing or dirty path>'` — the error still names the holder, not `Missing worktree`/`Uncommitted work`.
- AC4 A move into `merge` writes `merge_stamp` in state.yaml (e.g. leaf in `check.repair`, `phase x merge --slot B`; or operator recovery `failed` → `merge` without `--slot`), and re-entering `merge` refreshes it (move out to `failed` then back in, compare stamps differ or parse as ISO).
- AC5 Existing multi-merge tests reworked (plan D10): `completion prints only when the owner finishes…` (~line 238) merges `one`,`two`,`penultimate`,`last` via `Promise.all` — under the turn rule only the queue holder may move. Sequence them in holder order (unstamped leaves sort by slug: `last`, `one`, `penultimate`, `three`, `two` — verify by reading `mergeQueue`/the state, or give explicit `merge_stamp` values to control order) while preserving every existing assertion (completion prints, folder moves, retries). `completion leaves a chart holding a same-slug draft…` (~line 288) sequential `alpha`,`beta` merges — `alpha` first already matches slug order; add stamps or verify order. `asymmetric and empty leaf sources…` (~line 385) merges `one` then `two` sequentially — check slug order `one` before `two` holds, else set stamps. Search the whole file for other `phase <slug> merged` calls on sibling merge leaves and fix likewise. Every changed expectation cites this rule in the test name or a comment… actually keep it mechanical: tests assert behavior, and the reworked ordering is justified because the old expectations contradict the new holder rule (real source: the leaf's design).
- AC6 `bun test tests/phase.test.ts` passes, plus the changed-tests command.

## 3. Read-first

- `tests/phase.test.ts` (helpers at top, the tests listed in AC5, the `log.jsonl` mkdir trick ~line 312 for post-commit failure), `tests/helpers.ts` (`leaf()`, `cli()`, `fixture()`), `src/phase.ts`, `src/turn.ts`, `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

- `tests/phase.test.ts` only. Use `leaf(f, slug, 'merge', extra, container)` fixtures; control holder order via `merge_stamp` in `extra` (e.g. `'2026-10-05T20:00:00Z'`) or rely on slug order when no stamps exist.
- For AC4 recovery path: a `failed` leaf moves to `merge` via `phase x merge` (no `--slot` — operator recovery; check `routing`/`transition` allows `failed` → `merge`).

## 5. Do-not

- Do not assert on prose/wording beyond what existing tests already do; assert refusal + holder name + exit codes (lesson 2026-10-01).
- Do not modify `src/` files; a red test that is a real bug in landed code is a mismatch returned with evidence, not a fix.
- Do not weaken or delete existing assertions; where a `Promise.all` race is replaced by sequential calls, keep the same expectations (completion output, folder moves, retry behavior).
- Do not add `fakery` of herdr; phase-only tests use plain `cli` env.

Reasons restated: the one-holder guard changes the legal sequence of `merged` moves; sequencing preserves the coverage those tests were built for (completion printing, source closing, races).

## 6. Ordered steps

1. `bun install`; `git log --oneline -1`.
2. Read `src/turn.ts` `mergeQueue` to confirm ordering basis.
3. Write AC1–AC4 cases.
4. Rework AC5 fixtures; run `bun test tests/phase.test.ts` until green.
5. Run changed-tests command; commit with `Test-Change: tests/phase.test.ts added holder-guard and stamp coverage plus holder-order sequencing for the new one-holder-per-repo rule; no existing expectation weakened` trailer.

Advisory size: 1 file, under 30 turns.

## 7. Commands

- `bun test tests/phase.test.ts`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC6 hold and the commit exists. Report the commit id and which existing tests were resequenced.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

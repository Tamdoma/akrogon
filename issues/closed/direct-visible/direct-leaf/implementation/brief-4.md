# Brief 4 — U4: status surface (leafStart, TIME/first_prompt/total_ms, detail seats block)

## 1. Goal

Implement plan decision D9 of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (read it first — D9 plus Criterion 5 construction). Outcome: direct leaves get TIME from creation (`created` is a full ISO timestamp) in the text table, JSON `first_prompt`, and merges-table `total_ms`; the status detail seats block for a direct leaf prints recorded seat refs instead of the next-start recipe. The start-time half of `tests/direct-timing.test.ts` passes unmodified. Lifecycle status output byte-identical.

## 2. Numbered acceptance criteria

1. `bun test tests/direct-timing.test.ts --timeout=120000` — the TIME/first_prompt test and the merged total_ms test pass unmodified. The gaps test in that file belongs to wave sibling U2 (timing-report.ts) and may stay red in your worktree — record, not a mismatch.
2. `bun test tests/status.test.ts tests/status-json.test.ts --timeout=120000` — pass unmodified: lifecycle surface unchanged.
3. `bun run typecheck` exits 0.
4. `leafStart` is exported from src/status.ts and every consumer of `started.get(slug)` in status.ts routes through it.

A worker writes and edits no test: a planned test that is wrong or red once your code is correct is a mismatch returned to A, never a test fix.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — D9, criterion 5 construction.
- `src/status.ts` — `starts()` (~L155-163), TIME cells (~L235, rows ~256/270), `leafJson` first_prompt (~L618), merges total_ms (~L806), detail seats block, `leafSeatRefs` (label-based — NOT usable for direct).
- `src/state.ts` — the `direct` field type.
- `tests/direct-timing.test.ts` — the executable contract; read fully.
- `tests/status-fixture.ts` — the seed helpers the tests use.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `src/status.ts` ONLY. Wave sibling U2 threads one line in leafJson's `waits_on` (`requiredSlots` gains a param) — if both edits land in either order they must not conflict: keep your diff away from the `waits_on` line if at all possible. If U2's thread isn't present in your worktree yet, leave `waits_on` alone entirely — U2 owns it.

Must land first: wave 1 (schema). Parallel with U2/U3 in wave 2. Creation commit: filled by A below.

Binding facts copied from the plan:

- `leafStart(state, started: Map<string, number>): number | undefined` exported from src/status.ts: direct (`state.direct === true`) → `Date.parse(state.created)`; lifecycle → `started.get(state.slug)`.
- ALL consumers of `started.get(...)` in src/status.ts route through it: TIME cells in the leaf table, JSON first_prompt, merges-table total_ms, stopped/kept rows if they use it.
- `state.created` stays a plain string; lifecycle values are date-only, direct values full ISO — both parse fine; `flowReport`'s `created.slice(0,10)` is already compatible.
- JSON schema unchanged: first_prompt stays number|null.
- Status detail (text, `akrogon status <slug>`): for a direct leaf print the recorded seat refs (`seat.A`/`seat.B` session+address) instead of the next-start seat recipe lines. The JSON `seats` block is untouched (it resolves seats by labels — direct seats have none and that's correct/absent).
- `state.direct` is `boolean | undefined`; `=== true` is the only true form.

## 5. Do-not, reasons and exceptions

- Do not edit any test file. Exception: none.
- Do not touch any file outside src/status.ts: siblings own them. Exception: none.
- Do not change the JSON envelope shape or zod schemas in tests' expectations: the surface must stay shape-identical. Exception: none.
- Never run any `git stash` subcommand: every worktree shares one stash. Replacement: commit WIP and squash per the reset rule.
- Do not kill processes by pattern.

## 6. Ordered steps

1. Read plan D9 and direct-timing.test.ts fully; map every `started.get(` occurrence in src/status.ts.
2. Implement `leafStart`; rewire consumers.
3. Detail seats block direct branch.
4. Run section-7 commands; iterate.
5. Squash; single commit `feat: direct leaf status start times` (or similar).

Advisory size: 1 file, under 30 turns.

## 7. Commands

- `bun test tests/direct-timing.test.ts --timeout=120000` (record the gaps test state; not yours)
- `bun test tests/status.test.ts tests/status-json.test.ts --timeout=120000`
- `bun run typecheck`

Install first if node_modules absent: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify`. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold and the single squashed commit exists. Report the four lines plus commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): e01743a6 — VERIFY with `git log --oneline -1` at start and use what is there.

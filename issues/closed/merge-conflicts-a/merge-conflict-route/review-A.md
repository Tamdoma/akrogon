# Review A: merge-conflict-route

Base: `ef698c2d6ad50a9466f125419dbe0e4adaf2ae14`. Reviewed head: `edda614ea1d03697bee7b6437b10d8a29d7b3465` on branch `merge-conflict-route`. Debate off (`debate: "no"`); no positions/rebuttal artifacts, as expected.

## Findings

None.

## Verification evidence

- **C1/C7 (tests, typecheck, format)** — rerun in the worktree: `bun test tests/phase.test.ts` 18 pass / 0 fail; `bun test` 223 pass / 0 fail / 2915 expects; `bun run typecheck` clean; `bun run format` all files unchanged. The `conflict` case asserts `fix_rounds` stays 0 after merge → check.fix; the new `capped` leaf (`fix_rounds: 1`, the configured cap) in merge prints `moved check.fix` and lands in phase `check.fix`.
- **C2 (scope)** — `git diff --stat` touches only `src/phase.ts`, `tests/phase.test.ts`, three SKILL.md files and four guide files; `src/state.ts`, `src/status.ts`, `src/log.ts`, `src/routing.ts` unchanged. `grep -rn merge_rounds src/ tests/` empty.
- **C3 (merge-issue)** — `grep -n "check.fix" skills/merge-issue/SKILL.md` returns only the red-check line (35) and the repair-move footer line (58); the dead `moved failed` line (39) contains no `check.fix`, matching the criterion's intent. `grep -n -i conflict` returns only the A-resolves line (33) and the same-line index rule (37); no conflict routes to check.fix or preserves an unfinished rebase for B.
- **C4 (recorded items)** — merge-issue:33 names, in order: rebase target, prior reviewed head, resolved head, `git range-diff`.
- **C5 (guide)** — conflict greps across the four guide files return only A-resolving lines plus excluded problems.html:68; none sends a conflict to check.fix. phases.html:63 says "Each review → fix loop adds one to `fix_rounds`."
- **C6 (skill wording)** — implement-issue:49 and check-issue:43 name the rebased head A recorded at merge; "merge-conflict findings" and "rebase/conflict baseline" absent from `skills/`.
- **C8 (artifact)** — `/tmp/akrogon-merge-conflict-route-phase.log` exists, exit 0, 18 pass; the report records the path.
- **Code semantics** — `commitMove` increments `fix_rounds` only when `to === 'check.fix' && recorded.phase === 'check.review'`; the failed → implement reset branch is intact. The capped condition requires `state.phase === 'check.review'`; since check.fix is reachable only from check.review and merge, the guard is exactly the review-origin case. `requiredSlots` still reads `fix_rounds`, so a merge-origin repair (fix_rounds 0) is re-reviewed by A and B, matching D5.
- **AREA check** — the diff touches no `AREA.md`; nothing to verify.
- **Stale wording sweep** — remaining `conflict` mentions in skills/guide are unrelated (install paths, chart collisions, plan-issue design conflicts, files.html history).

## Verdict

`ready`

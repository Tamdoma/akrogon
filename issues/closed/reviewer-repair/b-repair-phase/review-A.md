# Review A: b-repair-phase

Base `6ab5e82`. Reviewed head `08545ec`. Worktree is clean, and the head is 4 commits ahead of base.

## Evidence

- `bun test tests/phase.test.ts`: 41 pass, 0 fail, rerun at `08545ec` during this review.
- The report shows `bun test` (355 pass), `typecheck` and `format` green at `659391f`. It also shows `test_changed` (241 pass) at `08545ec`, and a red-first run: 5 fails with `src/` at base. `08545ec` changes prose only, so I reused that evidence.
- `src/` callers: `rg` for phase literals in `src/next.ts`, `src/status.ts`, `src/log.ts` and `plugin/` finds no phase-specific branch. Dispatch is generic (`src/next.ts:460`), and `requiredSlots` gives `check.repair` slot B from routing.
- Skills under `~/.claude/skills` are symlinks into the main checkout (`readlink` shows `/home/ivan/Work/infra/akrogon/skills/check-issue`). Skill text and command therefore switch together at merge.

## Criteria

1. Met.
   - `src/phase.ts:229` sends a fix aggregate to `check.repair`.
   - The increment is at `:107`, and the cap at `:232-244` applies only from `check.repair` and records `phase: 'check.repair'`.
   - The rewritten review test walks:
     1. fix to `check.repair` with `fix_rounds` 0
     2. A refused
     3. `check.fix` with `fix_rounds` 1
     4. B-only re-check
     5. fix to `check.repair` with `fix_rounds` still 1
     6. `check.fix` to `failed` with the full failure record
     7. recovery keeps `fix_rounds`
   - The old route assertions moved, as the brief asks.
2. Met. `tests/next.test.ts:1797-1803` asserts the pane B prompt `check-issue post-repair slot=B phase=check.repair leaf=<path>`.
3. Met. The `## check.repair` section (`skills/check-issue/SKILL.md:65-83`) states:
   - scope and exceptions
   - `Handed to A`
   - the operator-actions pointer, without restating the rule
   - fail-first commits
   - before/after evidence
   - the base-run pointer
   - proof plus checks
   - the two finishes

   `docs/guide/phases.md`, `idea.md`, `setup.md`, `cheat.md` and `skills/watch-issues/SKILL.md:34` describe the same flow. The check.fix input rule is at `skills/implement-issue/SKILL.md:75`.

Docs: no `AREA.md` in the diff. I opened the changed-behavior page `docs/guide/phases.md`. Its claims match the code.

## Fixes

None.

## Nits

- N1. `docs/guide/phases.md:11` says "After a repair, B reviews the fix." Only A's repair from `check.fix` gets that re-check. B's own `check.repair` goes straight to merge. The line is true for A's repair but could be read as covering B's repair too. Deferred because line 105 states it exactly ("B re-checks only A's repair diff"). It would become a Fix if an operator or seat acted on the wrong reading.
- N2. The new test "check.repair hands B to merge uncounted" starts at `fix_rounds: 1`. It shows the count stays unchanged, but not from 0. Deferred because the code path (`commitMove` increments only on `to === 'check.fix'`) does not depend on the starting value. It would become a Fix if a counter branch keyed on the value were added.
- N3. The ASCII diagram in `docs/guide/phases.md:28-37` is crowded around the `check.repair`/`merge` join. Deferred because it reads correctly. It would become a Fix if the drawn edges contradicted `src/routing.ts`.

## Verdict

nits

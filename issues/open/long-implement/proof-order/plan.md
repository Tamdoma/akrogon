# Plan: proof-order

Debate is off. This plan comes from `brief.md`, `design.md` and the live files. The brief and design agree, so there are no conflict notes. The design names no credentials, so there is nothing to check in `.env`.

## Read first

- `skills/implement-issue/SKILL.md` (line 36 failed exit, line 38 base-run rule, line 44 delegation, lines 54-56 implement-end proof, lines 66-70 check.fix)
- `skills/implement-issue/worker-protocol.md` (line 11 wave clauses, lines 25-27 failure ownership)
- `skills/plan-issue/SKILL.md:57` (the size vocabulary: seconds, minutes, hours, unknown)
- `skills/chart-issues/assets/standing-design.md:12` (the slow-run rerun rule that rule 2 reuses)
- `skills/implement-issue/brief-template.md:21` (shared test resource record, already exists)
- `skills/AREA.md` (Non-obvious patterns, checked for staleness)

## Decisions

- D1. Define the three rules once, in a new paragraph in SKILL.md `## Shared context` placed after the base-run paragraph (line 38). The implement-end paragraph (line 54) and the check.fix after-repair paragraph (line 70) each name it where they say "supply passing proof". One definition means the two phases cannot drift apart. Criteria 1-3 are met by the defined text, and each phase paragraph points to it.
- D2. The paragraph opens with the slow-run definition: a slow run is any live run, or a proof whose plan.md size is hours or unknown. A command sized minutes is not slow.
- D3. Rule 1 text: before the first slow run, A runs every `checks` command and every done-criterion proof whose prerequisites are valid and which needs no slow or live result, whatever its own size. Checks and proofs that need a slow run's output run after it. The blocked-check rule and the final-proof rule stay as they are. It applies at implement end and after every check.fix repair.
- D4. Rule 2 text: in delegated mode only, and never on the final allowed repair round, A may start a unit or repair in a worker worktree while a slow run is in flight when all three hold: it does not consume the run's result, it edits nothing the run reads, and it shares none of the run's test resources. An overlap wave starts from the lane's committed HEAD. Pending lane commits, cherry-picks and any landing wait until the run returns. A then reruns the changed stages and their consumers under the existing slow-run rerun rule, which is cited and not restated. Inline mode and the final allowed round wait for the run.
- D5. Rule 3 text: A waits on a slow command's exit and status. A wait that returns before the command exits is followed by another wait. A never sleeps a fixed interval and then reads the log, and the exit status is the result, never a quiet log. No harness command or tool is named (no `sleep`, `tail`, `wait`, `Monitor`).
- D6. worker-protocol.md line 11, before-wave clause: keep "Before each wave A commits pending lane edits when there are any and otherwise reuses HEAD, making no empty commit" and add that it applies outside overlap, and that an overlap wave starts from committed HEAD with pending lane edits left uncommitted.
- D7. worker-protocol.md line 11, closing clause: change "every worker worktree is gone before criterion proof, checks and `akrogon phase`" to say independent proof may overlap workers under the SKILL.md rule, while the final passing proof, `checks` and `akrogon phase` run only after every worker commit has landed and every worker worktree is removed.
- D8. worker-protocol.md line 25: criterion proof and `checks` still belong to A and not to workers. Add that A may run independent proof beside workers under the overlap rule and that the final passing proof and `checks` run after the final worker lands. The sentence that workers run only the brief's changed-test command stays.
- D9. No docs change. `skills/AREA.md` ("A runs criterion proof plus every `checks` command before review") and `docs/guide/phases.md:91` stay true and do not describe proof order. No `src/` or test change, and no new test, per the design (a wording test would be a vanity test).
- D10. The held disagreement stays: no blocked-by on wave-table. Whichever leaf merges second rebases onto the other's wave text on worker-protocol.md line 11.

## Checklist, in order

1. `skills/implement-issue/SKILL.md`: add the proof-order paragraph to Shared context (D1-D5). Criteria 1, 2, 3.
2. `skills/implement-issue/SKILL.md` line 54: the opening points to the Shared context proof order for the order of proof. The existing opening "After the last implementation unit, with every worker worktree removed" stays, since the final proof still runs after worktree removal. Criteria 1, 2.
3. `skills/implement-issue/SKILL.md` line 70: the "After every repair" sentence points to the same proof order. Criterion 1.
4. `skills/implement-issue/worker-protocol.md` line 11: before-wave clause and closing clause (D6, D7). Criterion 2.
5. `skills/implement-issue/worker-protocol.md` line 25 (D8). Criterion 2.
6. Docs: no agent or human doc is affected (D9).
7. Run `bun run format` and commit the edits on the leaf branch. Write `implementation/report.md`.

## Done-criteria proof map

| # | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `git --no-pager diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/SKILL.md`, then read: slow-run definition, rule 1, "whatever its own size", reachable from both line 54 and the check.fix paragraph | A missing slow-run definition, rule 1 absent from either phase, or the blocked-check and final-proof rules removed | seconds | Any edit to the proof-order paragraph or either pointer |
| 2 | Same diff for SKILL.md and `git --no-pager diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/worker-protocol.md`, then read: three conditions, delegated-only, not on the final round, committed HEAD, deferred landing, changed-stage rerun, final proof after every landing and worktree removal | A dropped condition, overlap allowed in inline mode or on the final round, or worker-protocol still forbidding overlap or weakening the final-proof ordering | seconds | Any edit to the overlap wording or worker-protocol lines 11 and 25 |
| 3 | `git --no-pager diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/SKILL.md`, read rule 3, then `git --no-pager diff "$AKROGON_BASE"...HEAD -- skills/implement-issue \| grep -n -i -E '\b(sleep\|tail\|Monitor\|until\|timeout)\b'` | Missing wait-again-after-early-return, or a named harness command or tool | seconds | Any edit to the rule 3 wording |
| 4 | `bun run format`, `bun run typecheck`, `bun test`, and the resolved test_changed command `: "${AKROGON_BASE:?}" && bun test --changed="$AKROGON_BASE"` | Unformatted markdown, or a test that reads a skill file and now fails | seconds to minutes each | After the last edit to a skill file, and after any repair |

The grep in row 3 must return no hit that comes from the new text. Matches inside unchanged context lines of the diff do not count. This leaf has no slow run, so it has no restart boundaries.

## Verification notes

- The format check runs last, after every edit, because it can rewrite the markdown.
- Verify wording by function: each criterion's content exists and is consistent, not an exact phrase.
- Implement ends with the standard handoff: commit, report, then `akrogon phase proof-order check.review --slot A`.

# Plan: merge-conflict-route

Debate is off (`debate: "no"`); this plan synthesizes the brief and locked design directly. One code condition, one updated assertion, one new test case, three skill lines and five guide sentences. A resolves rebase conflicts at merge; `fix_rounds` counts only review → fix loops.

## Read first

- `issues/open/merge-conflicts-a/merge-conflict-route/brief.md` and `design.md` (binding decisions verbatim)
- `src/phase.ts` — `commitMove` fix_rounds ternary (lines 35-40), `transition` capped destination (lines 137-138)
- `src/routing.ts` — `requiredSlots` (unchanged; read to confirm the re-review rule needs no code)
- `tests/phase.test.ts` — `conflict` case at lines 91-93 inside the `review aggregates verdicts` test; `tests/helpers.ts` `leaf()` for the `fix_rounds` extra field
- `skills/merge-issue/SKILL.md` — lines 33, 35, 37
- `skills/implement-issue/SKILL.md` — line 49; `skills/check-issue/SKILL.md` — line 43
- `docs/guide/phases.html` lines 63-64, `problems.html` line 64, `in-practice.html` line 129, `merge.html` line 63
- `learnings/LESSONS.md`

## Decisions

- **D1 — A resolves every rebase conflict at merge (locked 12a).** A resolves in the worktree keeping both true sides, completes the rebase, reruns every `checks` command, pushes. No mechanical-versus-semantic rule; conflicts are never routed to check.fix.
- **D2 — A records four items before the push (locked 13a).** In `review-A.md`, in order: the rebase target, the prior reviewed head, the resolved head, and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` where old-base is the `AKROGON_BASE` value before the post-rebase refresh. Green checks are the gate; no second reviewer.
- **D3 — `fix_rounds` rises only on check.review → check.fix (locked 14a).** `src/phase.ts` commitMove ternary: the increment branch also requires `recorded.phase === 'check.review'`. Merge → check.fix leaves it unchanged; the failed → implement reset stays. No merge-side counter, no `merge_rounds` field.
- **D4 — The cap only fails review-origin repairs.** `src/phase.ts` capped condition also requires `state.phase === 'check.review'`; a merge → check.fix move never produces `moved failed`. The `moved failed` sentence at merge-issue:37 becomes dead text and stays — L4 owns the failed-diagnosis rule.
- **D5 — Re-review of a merge-origin repair needs no routing change (locked 16a).** `requiredSlots` keeps reading `fix_rounds`: a merge-origin repair with `fix_rounds` 0 is re-reviewed by A and B like an initial review; with an earlier review fix, by A alone. Skill and guide wording says "re-reviewed" without naming the slot.
- **D6 — Red checks after a clean rebase route as today (locked 15a).** B repairs, the repair is re-reviewed, A merges. A never fixes forward in merge.
- **D7 — Skill and guide wording.** merge-issue:33 becomes two lines: the conflict-resolution line recording the four D2 items before running checks, then on its own line the red-checks route (append failing output, rebase target commit and rebased head to `review-A.md`, call `akrogon phase <slug> check.fix --slot A`, print the repair footer). merge-issue:35 keeps the same-line index rule content without "during repair". implement-issue:49: a repair requested from merge starts at the rebased head recorded in `review-A.md` and treats the failing output as the finding. check-issue:43: the baseline reads the prior reviewed head or the rebased head A recorded at merge; "rebase/conflict baseline" goes. Guide: phases.html:63 counts review → fix loops; phases.html:64 says A resolves a rebase conflict and records it in review-A.md, a red check → check.fix; problems.html:64, in-practice.html:129 and merge.html:63's last sentence say A resolves the conflict in the merge, records it in review-A.md and reruns the checks, with "A re-checks" becoming "the repair is re-reviewed". problems.html:68, setup.html:67 and state.html:85 stay.

## Ordered checklist

1. `src/phase.ts` — add `recorded.phase === 'check.review'` to the fix_rounds increment branch; add `state.phase === 'check.review'` to the capped condition.
2. `tests/phase.test.ts` — the `conflict` case asserts `fix_rounds` is 0 after `phase conflict check.fix`; add a sibling leaf in merge with `fix_rounds` set to the configured cap (1) asserting stdout `moved check.fix`, not `moved failed`. Log row keys unchanged.
3. `skills/merge-issue/SKILL.md` — replace line 33 with the two D7 lines; rewrite line 35 without "during repair"; line 37 and the push/non-fast-forward/lost-reply lines stay.
4. `skills/implement-issue/SKILL.md` line 49 and `skills/check-issue/SKILL.md` line 43 per D7.
5. `docs/guide/` — phases.html:63-64, problems.html:64, in-practice.html:129, merge.html:63 per D7.
6. Verify: `bun test tests/phase.test.ts`, `bun run typecheck`, `bun run format`, `bun test`, then the criterion greps and the tee'd artifact run below.

## Acceptance criteria (from done-criteria)

1. `bun test tests/phase.test.ts` passes: merge → check.fix leaves `fix_rounds` unchanged; a merge leaf with `fix_rounds` at the cap moves to check.fix, not failed.
2. `git diff --stat` shows `src/state.ts`, `src/status.ts`, `src/log.ts`, `src/routing.ts` unchanged; `grep -rn merge_rounds src/ tests/` is empty.
3. `grep -n "check.fix" skills/merge-issue/SKILL.md` returns only the red-check line, the dead `moved failed` line 37 and the repair-move footer line; `grep -n -i conflict skills/merge-issue/SKILL.md` returns only lines describing A resolving and recording — none containing `check.fix` or preserving an unfinished rebase for B.
4. The merge-issue conflict sentence names, in order: rebase target, prior reviewed head, resolved head, range-diff.
5. `grep -n -i "conflict" docs/guide/phases.html docs/guide/problems.html docs/guide/in-practice.html docs/guide/merge.html` returns, apart from problems.html:68, only lines naming A resolving; none sends a conflict to check.fix. phases.html:63 says review → fix loops raise `fix_rounds`.
6. implement-issue and check-issue name the rebased head A recorded at merge; neither says "merge-conflict findings" or "rebase/conflict baseline".
7. `bun test`, `bun run typecheck`, `bun run format` pass.
8. `bash -o pipefail -c 'bun test tests/phase.test.ts 2>&1 | tee /tmp/akrogon-merge-conflict-route-phase.log'` exits 0; the report records the path.

## Open limitation

A's conflict resolution is gated only by green checks — no reviewer reads the range-diff unless a check fails. Accepted by locked 13a; the recorded range-diff in review-A.md is the audit trail. Merge → check.fix trips are unbounded by design (one red-check trip in 137 merges measured).

Dependencies: none. `command-deletions-batch` and `plan-is-contract-skills` touch overlapping files but do not order this work. Credentials: none.

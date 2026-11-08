# Report: run-count-rule

Base: 5499e3dab209ccc6fae14c8f4568e62e5c4c15c2 (= origin/main at handoff; no rebase moved the branch). Committed head: 29f01f38bc0c7ad023844029dfd409705bb67acd.

## Changed files and reasons

- `skills/plan-issue/SKILL.md` — `grants[]` reuse paragraph extended to the shared count rule (artifact `plan.md`). U1.
- `skills/implement-issue/SKILL.md` — same rule (artifact `implementation/report.md`), plus the worker-paid-count clause on the delegation paragraph. U1.
- `skills/check-issue/SKILL.md` — same rule (artifact `review-<slot>.md`), plus the `check.review` audit paragraph placed inside `## check.review` before its Finish paragraph. U1 + A's one-line repair (the worker first landed it after the Finish/`recorded` pair; moved before Finish).
- `skills/merge-issue/SKILL.md` — same rule (artifact `review-B.md`). U1.
- `skills/chart-issues/SKILL.md` — `## Take` grant paragraph extended with unit wording, `stop_line` exclusion, renewal and door counting (D4). U2.
- `skills/chart-issues/assets/shapes.md` — `bounds`/`stop_line` placeholders show units and the no-count rule (D5). U3.
- `skills/chart-issues/assets/standing-design.md` — recorded-output clause extended: a warned call past a repeat-count bound is covered, a call outside the grant still stops (D6). U3.

Commits: fa87b932 (U1), 398a3e35 (U2), 8cd37a51 (U3), 29f01f38 (A repair: audit paragraph placement inside `## check.review`).

## Worker returns folded in

- U1 (dc4eaa0): all four SKILL.md edits applied verbatim; all 13 substrings present in all four paragraphs; returned limitation noted (insertion-point description had drifted — it placed the paragraph correctly before `## check.repair`, later refined by A). Cherry-picked as fa87b932.
- U2 (4860b494): Take paragraph extended; the brief's `grep -c` verification expectation was miscounted (paragraph is one physical line; counts 1) — A authorized proceeding, all seven substrings pass per-substring checks. Cherry-picked as 398a3e35.
- U3 (cca48817): both asset edits applied; all verifications passed. Cherry-picked as 8cd37a51.

## Done-criterion proof (all on committed head 29f01f38)

Each ran through `akrogon run-check`; red-at-planning logs are recorded in `plan.md`.

1-2. Shared rule in all four skills: `check crit12-shared-rule: 0 .../check-crit12-shared-rule-1793795846153-3618306.log` (all 13 rule substrings in all four `grants[]` paragraphs; identical wording observed in `git diff` — same added sentences, seat/artifact tokens only).
3. check.review audit paragraph: `check crit3-review-audit: 0 .../check-crit3-review-audit-1793795846122-3618308.log` (`no covered operation`, `warned overrun`, `timings.jsonl`, `Operator actions` all present in `## check.review`, before the section's Finish paragraph per `git diff` hunk context).
4. Worker paid count: `check crit4-worker-count: 0 .../check-crit4-worker-count-1793795849569-3631468.log`.
5. Take grant + shapes placeholders: `check crit5-chart-grants: 0 .../check-crit5-chart-grants-1793795849587-3631457.log` (all 7 Take substrings, shapes bounds example, `stop_line: <never-cross condition; never a repeat count>`).
6. standing-design covering-grant clause: `check crit6-standing-design: 0 .../check-crit6-standing-design-1793795853094-3652335.log`.
7. Diff scope: `check crit7-diff-scope: 0 .../check-crit7-diff-scope-1793795853084-3652337.log` — `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` equals exactly the seven named files; `src/`, `tests/` unchanged; `issues/` cannot appear on the branch.

## Checks

- `akrogon verify` on head 29f01f38: green — `verify leaf 29f01f38bc0c7ad023844029dfd409705bb67acd: green` (test log `check-test-1793795975860-3663351.log`; format and typecheck green in the same receipt).

## Known limitations

- The rule is written prose the seats must follow (signpost 1c); a seat can still miscount, and overspend past a bound is allowed-with-warning by operator choice 2b. The only reconciliation is the check.review audit against `check-<name>-*.log` and `issues/timings.jsonl`, which sloppy bookkeeping can defeat silently — accepted operator residual risk. (Carried from plan.md.)
- The crit3 awk selector matches the paragraph containing `check.review` and so cannot prove section placement by itself; placement is shown by `git diff` hunk context and review reading (recorded in plan.md).
- Brief-1's insertion-point description and brief-2's `grep -c` expectation were imprecise in ways that did not change the verbatim outcome; both resolved inside the pass, recorded above.

## Unverified criteria

None.

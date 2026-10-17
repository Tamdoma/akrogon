# Review B: autopilot-mode

Date: 2026-10-17. Phase: check.review. Verdict: fix.

Base: `0dfae200ae84fc46f10e0d07973c78721cf5d7c9`.
Reviewed head: `825fb5d7d808e91b39ed7ea0647a93e3ae059964`.

Initial blind review of the whole diff. No peer review read or peer contacted. The plan records `debate: no`, so positions-B.md and rebuttal-B.md are absent as expected. No code edited or commits made.

## Fixes

### F1. Restrict consultant dropping to consultant failures, preserving A-call repair

Location: `skills/chart-issues/assets/questions.md:46`, added sentence ending “a `failure`, `blocked` or non-zero exit drops that consultant”.

Source and trace: A's required peer-exchange call runs `peer-ask.ts`. That real entry point returns exit 1 before prompting any consultant when A reuses an existing return path (`skills/chart-issues/scripts/peer-ask.ts:105–110`), supplies duplicate return paths (100–103), or supplies invalid arguments (88–97). These are A-call errors, not consultant failures. The new questions.md instruction nevertheless explicitly drops the consultant for the session on that exit, contradicting `SKILL.md:139`, which requires repairing A's own mistake without dropping anyone. A batched call can also fail validation before any peer is prompted, so its exit alone cannot identify a failed consultant.

Consequence today: the door following the asset it must read before exchanges permanently loses a healthy named consultant after a repairable local call error, and ignores that consultant's later work. This violates brief done-criterion 6 and the plan's C6/D1 exception for A-call mistakes. The criterion explicitly names this scenario, so this is a blocking prose-contract defect, not a speculative coverage request.

Repair: make the asset distinguish the documented consultant-loss outcomes and actual prompt refusals from local call errors. Preserve repair of A's own invocation without dropping consultants, consistent with the existing Autopilot section. No script change or wording assertion test is needed. Re-read the corrected asset and section together as the planned prose-boundary proof.

Evidence: `check review-B-lines: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-review-B-lines-1792224980821-2113767.log`, read source and emitted prose. Also `check review-B-autopilot: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-review-B-autopilot-1792224962231-2092227.log`.

## Verification and scope

- Read brief, design, full plan, implementation report, the check skill and ponytail reference, the repository's lesson rule, reference index, changed guide page and all changed behavior text. Audited the old operator-answer/attended/peer-outcome wording against the new mode. C1–C5 and C7–C10 are represented in the four files. C6 has F1. The skill remains operator-invoked, lifecycle-only under autopilot, with approvals operator-only and handed-list limits explicit.
- Diff lists exactly `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, and `skills/chart-issues/assets/shapes.md`. No AREA.md, test, runner, fixture, lockfile or lesson change. Worktree clean. Evidence: `check review-B-lines: 0` at the path above. No changed AREA.md requires a path listing.
- `Test-Change:` trailers in base..HEAD: none. The sole commit changes no path matched by `src/test-files.ts`, so none is required. Commit bodies and the path rule were inspected.
- Read the report's current-head logs back with `akrogon log`: `check-autopilot-record-shape-1792224706186-860052.log` is empty on success as expected; `check-chart-shapes-1792224706338-860151.log` records 7 pass, 0 fail, including readiness-shape parsing and guide anchor resolution; `check-format-1792224710131-860827.log` records all files formatted; `check-test-1792224908072-860827.log` records 993 pass, 0 fail; `check-typecheck-1792224910469-860827.log` records `tsc --noEmit`. All paths are under this leaf's `implementation/`. The report records the green verify receipt for reviewed head 825fb5d. No tests changed since those runs, and no planned test was skipped, filtered or disabled by this diff. No full-check rerun was warranted.
- The report's V1 prose read did not catch F1. B's kept extraction and source trace supply the review evidence. Existing mechanical gates do not assert this prose behavior, as the locked design requires. This review does not require adding such assertions.

## Nits and operator actions

None. No reusable Nit to record, no operator-only blocker, and no live mutation performed.

## Verdict

fix. Request check.repair for F1, a correction within the existing locked decisions and owned text surface.

## 2026-10-17 check.repair

Read both initial reviews, refreshed brief/design/plan/report and the check skill references. A reported no Fixes. B's F1 is the only blocking finding. No locked decision, test expectation or live action needs changing, so nothing is handed to A.

F1 repaired in `0dd0138bd748fcfc484d7874df85ac941539d42b` (`chart-issues: preserve consultants after local call errors`), parent `825fb5d7d808e91b39ed7ea0647a93e3ae059964`. Only `skills/chart-issues/assets/questions.md` changes in the repair. The asset now drops only the affected consultant for `failure`, `blocked` or a herdr prompt refusal, repairs A's own call mistakes without dropping anyone, and states that a non-zero exit alone does not identify a consultant to drop. The budget rule and all other behavior remain as reviewed. This is a docs Fix, so it has one docs commit and no wording-assertion test or Test-Change trailer.

Before evidence: the asset said “a `failure`, `blocked` or non-zero exit drops that consultant”. `check repair-B-before: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-repair-B-before-1792225126072-2347469.log` captures the contradiction with the canonical own-call-repair rule. Read back with `akrogon log`.

After evidence: reran the plan's V1 extraction commands, including the C6 `grep` and canonical Autopilot section, on the committed repair. `check repair-B-proof: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-repair-B-proof-1792225149922-2419599.log`, read back with `akrogon log`. Agent judgment at the planned prose boundary: an existing return-path or argument error is repaired without dropping a healthy consultant; a refused prompt drops only its affected consultant; completed consultants in a batched call remain available. This passes the planned C6 proof B did not write. The same extraction confirms C2's exception and approvals boundary, and C10 still lists exactly the four owned files. C1/C3–C5/C7–C9 retain their previous prose/marker proofs because their inputs did not change.

After the configured locked install, reran the plan's V4 command unchanged: `akrogon run-check --name chart-shapes -- bun test tests/chart-shapes.test.ts tests/docs-links.test.ts`. `check chart-shapes: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-chart-shapes-1792225158557-2489031.log` records 7 pass, 0 fail. No tests, helpers, fixtures or runner configuration changed.

An initial edit attempt supplied Python through stdin to run-check, which did not pass that input to the child. The attempted commit therefore reported nothing to commit. Retried with `python3 -c`, confirmed the saved diff, and committed the repair above. Neither attempt changed tests or product behavior beyond the recorded repair.

No operator actions, live mutations, reusable Nits held by B, or Handed to A items remain.

`akrogon verify` completed on committed head `0dd0138bd748fcfc484d7874df85ac941539d42b`: `verify leaf 0dd0138bd748fcfc484d7874df85ac941539d42b: green`. Format passed (`verify format: 0`, `implementation/check-format-1792225153321-2420985.log`), all 993 tests passed with 0 failures (`verify test: 0`, `implementation/check-test-1792225305330-2420985.log`, 151.90 seconds), and typecheck passed (`verify typecheck: 0`, `implementation/check-typecheck-1792225307494-2420985.log`). All three logs read back using `akrogon log`. No merge checks run. F1 resolved, requesting merge.

Phase result: `akrogon phase autopilot-mode merge --slot B` printed `moved merge`. Automatic dispatch then reported `herdr pane list` exit 1, `server_not_running`: no server at `/home/ivan/.config/herdr/herdr.sock`. The phase move succeeded, but no merge seat was dispatched. Evidence: `check repair-B-phase: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-repair-B-phase-1792225363447-3204793.log`. Next pass is merge-issue B; starting or attaching Herdr is the operator's next step if automatic dispatch is wanted.

## 2026-10-17 merge, solo attempt 36d4d30a-410a-40a9-bb2f-d39c6cf2ca68

Fetched origin and rebased onto `origin/main` at `309fae16c881a4ab5eb9d688b4da6a3c317f82e8`. Prior reviewed base: `0dfae200ae84fc46f10e0d07973c78721cf5d7c9`. Prior reviewed/repaired head: `0dd0138bd748fcfc484d7874df85ac941539d42b`. Resolved head: `37e01e18f550bad20a39e6a21b31fc54ea9df502` (implementation `d8612b3`, repair `37e01e1`).

Conflicts in SKILL.md Open and questions.md's exchange paragraph came from the landed any-consultants changes. Preserved main's unrestricted peer count, naming order and pane creation; retained autopilot's first-reply pointer, budget rule, and F1's own-call-repair distinction. No test expectations changed. Other automatically merged changes retain both sides.

Before checks, computed `git range-diff 0dfae200ae84fc46f10e0d07973c78721cf5d7c9..0dd0138bd748fcfc484d7874df85ac941539d42b 309fae16c881a4ab5eb9d688b4da6a3c317f82e8..37e01e18f550bad20a39e6a21b31fc54ea9df502`. Evidence: `check merge-B-rebased: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-merge-B-rebased-1792225408616-3378977.log`. The changed context is main's peer generalization; both leaf commits remain. Re-removal helper returned `none`: `check merge-B-lessons: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-merge-B-lessons-1792225408750-3379109.log`. No lesson-removal commit required.

`akrogon verify --attempt 36d4d30a-410a-40a9-bb2f-d39c6cf2ca68` passed: `verify merge 37e01e18f550bad20a39e6a21b31fc54ea9df502: green`. Format exit 0 (`implementation/check-format-1792225423970-3390777.log`), test exit 0 with 994 pass and 0 fail in 148.21 seconds (`implementation/check-test-1792225572274-3390777.log`), typecheck exit 0 (`implementation/check-typecheck-1792225574319-3390777.log`). Read all three with `akrogon log`. No advisory failures or configured merge checks. Final surface check preserves both conflict sides, has a clean worktree, passes diff whitespace checks and changes exactly the four owned files relative to the new base: `check merge-B-final-surface: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-merge-B-final-surface-1792225421940-3390702.log`.

Gathered the completion owner's ISSUE.md and both autopilot-mode and any-consultants briefs before landing. No new live grants or fixture operations were required.

`merged --check --attempt 36d4d30a-410a-40a9-bb2f-d39c6cf2ca68` returned `ok`. The push call then printed `rerun tested=37e01e18f550bad20a39e6a21b31fc54ea9df502 pushed=6f31ca94490e98f0306e77a7ad63316cef314b45`: main advanced to `7adb3dae4dc116740a3265cf8526b79311406be6`, and the command restacked onto it. Compared old and new heads: only main's `src/status.ts` and `tests/status.test.ts` changes differ; autopilot's files are unchanged. Worktree clean. Evidence: `check merge-B-restack: 0 /home/ivan/Work/infra/akrogon/issues/open/autopilot/autopilot-mode/implementation/check-merge-B-restack-1792225628278-3884221.log`. Re-running merge verify on the new head under the same attempt.

Restack verification passed: `verify merge 6f31ca94490e98f0306e77a7ad63316cef314b45: green`, using the same `akrogon verify --attempt 36d4d30a-410a-40a9-bb2f-d39c6cf2ca68`. Format exit 0 (`implementation/check-format-1792225625862-3864301.log`), test exit 0 with 994 pass and 0 fail in 145.70 seconds (`implementation/check-test-1792225771669-3864301.log`), typecheck exit 0 (`implementation/check-typecheck-1792225773791-3864301.log`). All read back with `akrogon log`. No repair or advisory failure.

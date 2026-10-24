# Design: suite-refusal

## Binding decisions, verbatim

### receipts (issues/chart/verify-waste/forks/receipts.md)

Taken by A under autopilot 2026-10-24, consultants B (codex) and D (claude-fable-5-1). These are A's picks, not operator words.

- Q4 `akrogon run-check` refuses a command whose text equals a configured check or a configured member and prints the `akrogon verify` command to use (A,D). `akrogon verify` accepts an explicit merge scope from check.fix, so a seat repairing a red merge has a route that writes a receipt (B). Reason: the refusal alone leaves check.fix no way to rerun the merge suite (src/verify.ts:396 picks scope from phase), the route alone leaves the hand path open.

Refinement at draft review (A, from D 10-11): "configured check" narrows to `merge_checks` entries. `checks` are the cheap commands implement and check.fix must run through their printed form, so refusing them would block every leaf's required check run. The fork's target, the hand-run full suite, is a `merge_checks` entry.

Operator amendment 2026-10-24, on A's recommendation ("yes, amend it"): drop the `akrogon verify --scope merge` route. Reason: a full suite in check.fix is wasted after the rebase onto a moved main, and extra suites on the host make timing tests fail (watch-framework analysis 2026-10-24). check.fix reproduces a red narrowly; the merge turn runs the merge checks once. This replaces B's route request.

## Shape

- One matcher, three forms, exact equality: argv equals the entry text split as the shell would; or argv is `['sh', '-c', text]`; or argv is `['sh', '-c', setupCommand(config, text)]` (src/config.ts:346-350). Anything else runs, including the entry text with extra arguments. (B,D)
- `withSetup` (src/config.ts:352-363) maps `merge_checks` to `akrogon verify --attempt <id>`, so the printed config never shows a refused line. (D)
- No new verify flag. Scope stays phase-derived (src/verify.ts:396). (operator amendment)
- verify's own `checkedRun` calls are not run-check invocations and are not refused.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Proofs use the existing CLI tests with a temporary registered repo whose checks are small shell commands. No suite runs, no herdr, no model call.

## Leaf architecture

- Owned surfaces: src/run-check.ts, `withSetup` in src/config.ts, their tests, the run-check and merge-check-runner lines in skills/implement-issue/SKILL.md, skills/merge-issue/SKILL.md and skills/check-issue/SKILL.md (:69, :93), docs pages for run-check and config output. (B,D)
- Not owned: receipt reuse and the fresh-base skill lines (member-receipts).

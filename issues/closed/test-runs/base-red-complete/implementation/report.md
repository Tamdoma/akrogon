# Implementation report: base-red-complete

Base: `4b74a0870fa3243f6b79e658204ff0f7ff3b4716`. Committed head: `d5db49d` (worker picks `8713b03` → `c27cb1f`, `96f719f` → `d5db49d`). Branch `base-red-complete`, worktree clean.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` — replaced the base-run paragraph (line 38) so red on base requires completed, comparable runs with the seat's recorded shared-cause judgment, a non-comparing completed base goes to repair, an incomplete base run gets its own `incomplete base run <sha>: <cause>` stop with no rerun, and the base run uses the longest harness run mode. Slot token `A`, artifact `implementation/report.md`, as before.
- `skills/check-issue/SKILL.md` — same rules once, keeping "existing specific concern rerun case", `--slot <A|B>` for the reviewing slot, and `review-<slot>.md` as before.

Both keep the trigger/judgment gate, single base run, `mktemp -d` + `git worktree add --detach`, dependency install, log redirection, worktree removal before any outcome, artifact fields, and "a stop, never a handoff". Delegated mode: two one-file workers in one wave (`base-red-complete-u1`, `-u2`, both removed), commits cherry-picked serially onto the lane with changed tests run after each pick.

## Commands run

- `bun install --frozen-lockfile` (each worker worktree): 9 packages, seconds.
- `bun test --changed=4b74a0870fa3243f6b79e658204ff0f7ff3b4716 --timeout=30000` (each worker and after each lane pick): `--changed: N changed file(s), but no test files are affected / 0 pass / 0 fail`, seconds. Expected for a prose-only diff.
- `bun run format`: all files `unchanged`, seconds.
- `bun run typecheck` (`tsc --noEmit`): exit 0, ~2 s.
- `bun test --timeout=30000`: 395 pass, 0 fail, 18 files, 11.39 s.
- `git diff "$AKROGON_BASE"...HEAD --stat`: lists only `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` (criterion 4).

## Done-criteria

1. `skills/implement-issue/SKILL.md` paragraph — verified in the diff: completed-runs rule with exit status and terminal result kept before any reporting pipeline (`echo`, `grep`, `head`); same command, args, scope, install and material conditions; recorded shared-cause judgment with names not required to match; the `red on base <sha>` stop only then; completed base that does not establish the comparison takes the repair path; incomplete-run stop `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot A` with no automatic rerun and no base-defect claim; longest harness run mode. Each stated once.
2. `skills/check-issue/SKILL.md` paragraph — verified in the diff: same rules once, `--slot <A|B>` and `review-<slot>.md` unchanged, "specific concern rerun case" clause kept.
3. #53 walk-through — below.
4. `git diff "$AKROGON_BASE"...HEAD --stat` lists only the two SKILL.md files — verified above.

## #53 walk-through (criterion 3)

Evidence: framework `issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md:175-215`.

- First base run: `bun run test:cf-workers-deploy` on detached base `ab700d4cc` was "killed by the background time limit after about 25 min, no final counts" — it never reached its terminal result. Under the new paragraphs this is incomplete: the seat keeps the log (`evidence/f9/cf-workers-deploy-base-ab700d4cc.log`) and termination cause and ends `akrogon phase <slug> failed --reason "bun run test:cf-workers-deploy incomplete base run ab700d4cc: killed by background time limit before terminal result" --slot A`, with no automatic rerun and no base-defect claim. The old paragraph produced `red on base ab700d4cc` from that killed run — exactly the defect this leaf removes. The same rule now also keeps the leaf run's own exit status (the run was actually 319 pass / 1 fail) instead of the `exit 0` its trailing `grep | head` wrapper reported.
- Later completed pair: whole-file `bun test ./.claude/skills/dev-cf-workers-deploy/test/deploy-core.test.ts` on leaf `1b95a0cfc` and detached base `ab700d4cc` both completed — exit 1, 238 pass / 1 fail each — same command, args, scope, install (`bun install --frozen-lockfile`) and material conditions. Leaf failed fixture `07-changed-js-file`, base failed fixture `13-wrong-sitemap-host`, both 300000 ms timeouts with the identical `setViewportSize: Target page, context or browser has been closed` tail at `unchanged-output.ts:527`. Names differ; the new paragraphs require the recorded shared-cause judgment (one capture defect), not matching names, so this pair reaches `red on base ab700d4cc`. Under the new rules the leaf takes the correct outcome in both scenarios.

## Known limitations

- `skills/AREA.md:25` summarises the rule as "one base run at `AKROGON_BASE`"; criterion 4 restricts this diff to the two SKILL.md files, so any tightening there is a follow-up leaf (noted in plan.md).
- The `red on base` path itself is prose guidance for future seats; it is not executable in this leaf and has no test by design (standing rule: no text-grep tests).

## Unverified criteria

None.

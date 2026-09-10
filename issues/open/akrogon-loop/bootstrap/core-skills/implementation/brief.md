# Implementation brief: core-skills

## 1. Goal

Implement plan decisions D1–D8 in the `core-skills` worktree and commit the source changes. Replace the five loop skill families and the broadcast sender. The operator owns phase changes for this hand-built leaf.

## 2. Acceptance criteria

1. Five short, self-contained skills cover the fixed phases, artifact names, command calls, compaction recovery and printed footer, without old lifecycle machinery.
2. Implement uses the eight-section template and semantic four-content worker report, delegated/inline/standalone modes, changed tests, full-suite ownership and final-round self-repair.
3. Check and merge implement concrete-defect verdicts, repair-only re-check, failed diagnosis, configured rebase/push, lost-reply ancestry and issue-complete broadcast.
4. Broadcast delivers one message per configured target using only the external secret file, retries a failed delivery once, exposes failures and writes no records.
5. Ponytail copies match the supplied file. Retired folders and obsolete owned references are removed, unrelated skills preserved.
6. Sender behavioral tests and the full available suite pass. Skill contracts and reference targets receive semantic inspection. Report separates verified results from later live integration and operator checks.

## 3. Read-first

Read leaf `plan.md`, `brief.md`, `design.md`, and `ponytail.md`. Read the five existing skill entrypoints and broadcast sender/helper imports before replacement. Existing pattern: `skills/<family>/SKILL.md` plus skill-local references/scripts. Read `skills/implement-issue/ponytail.md` after copying it. Sibling command design fixes broadcast shape as `broadcast.discord.webhook_env: [NAME]` and root suite as `bun test`.

## 4. Change list

Create `skills/plan-issue/SKILL.md`. Rewrite implement, check, merge and broadcast entrypoints. Add implement's `brief-template.md` and `worker-protocol.md`, plus the two ponytail copies. Replace `skills/broadcast-issue/scripts/discord-send.ts` and add a small skill-local behavioral test file and project dependencies if boundary parsing needs them. Delete consult/explain folders, implement/check advisory files and broadcast's obsolete target/record/setup files.

Interfaces: prompt `<skill> <slug> slot=<A|B> phase=<phase>`, effective settings from `akrogon config`, moves via `akrogon phase <slug> <next> --slot <A|B>`, review verdict `ready|nits|fix`, completion output `issue complete`, failure output `moved failed`. Broadcast target names are safe config values, secrets are read from `~/.config/akrogon/env` only. The command leaf owns its package, source, config and tests. Do not depend on its unfinished output encoding.

## 5. Do-not

Do not edit state or invoke phase transitions because the operator explicitly owns them this pass. Do not change unrelated skills, command code, root package/config, install roots or README because they belong to other work. Do not send real broadcasts or run real herdr/GitHub because verification uses isolated boundaries. Do not weaken tests or assert skill wording. A worker returns a mismatch with evidence to B instead of changing scope or an interface. Exceptions: a specific operator instruction can change scope, and a literal command/number/fixed reference may be checked exactly. These reasons and exceptions also govern repair.

## 6. Ordered steps

1. Write the five entrypoints and implement references, copy ponytail (criteria 1–3, 5).
2. Write fail-first sender scenarios, replace sender and remove obsolete helpers (criterion 4).
3. Delete retired skill folders and inspect owned references (criterion 5).
4. Run changed tests during changes, commit coherent batches, then B runs the full suite and completes section 8 (criterion 6).

Advisory size: about 15 authored files plus scoped deletions, under 30 turns. Clearly exceeding this calls for a mismatch review, not a hard stop. This hand-built pass executes directly while the command/config implementation is unavailable. No legacy QA workflow is reinstated.

## 7. Changed-tests command

`bun test ./skills/broadcast-issue/scripts/discord-send.test.ts`

This explicit selection is the changed-test command until the sibling command supplies effective config and AKROGON_BASE. Workers receive only this command, not the full suite.

## 8. Done-when and report

Done when the source is committed, criteria have supporting evidence, the full available suite is green, and the four report contents below are filled. For this repo, tests exercise real temporary files/processes and substitute external services at one boundary. No real panes, install roots, GitHub or herdr socket. New tests need an observable contract or observed defect, not coverage or prose matching. User-visible sender verification leaves command output under the leaf's implementation folder.

Evidence: `implementation/full-suite.txt` contains the final root `bun test` output: 6 pass, 0 fail, 35 assertions across one test file. Targeted sender scenarios and `bun run --cwd skills/broadcast-issue typecheck` passed. All five skill validators passed, local Markdown references resolve, both ponytail copies match byte for byte, and `git diff --check` passed. An independent read-only walkthrough found no behavioral gaps in incomplete-report/shared-interface repair, inline/standalone, repair review and lost-push/issue-completion scenarios. No wording tests were added.

Commits on `core-skills`: `5585ce8` replaces the five families and retired references; `36108aa` replaces sender mechanics with isolated tests and skill-local locked dependencies. The worktree is clean. The authoritative state was read as `implement` and not modified.

Changed files and reasons: Created `skills/plan-issue/SKILL.md`; rewrote implement/check/merge/broadcast entrypoints; added implement's brief template and worker protocol and both ponytail copies; deleted consult/explain folders and old implement/check advisory files. Replaced `skills/broadcast-issue/scripts/discord-send.ts`, removed its target/receipt helpers and setup guide, and added its behavioral test, package/lockfile, strict typecheck config and local node_modules ignore. These are the complete source changes, all within the owned skill folders.
Tests run: Root `bun test`: 6 pass, 0 fail, output in `implementation/full-suite.txt`; targeted sender tests: 6 pass; strict TypeScript check: exit 0; five skill validators: valid; local-reference and byte-copy checks: pass; `git diff --check`: pass. The initial new scenarios were red before sender replacement; final scenarios exercise real subprocesses and temporary files with the network substituted. An initial home-directory mock did not isolate the path and read the real env file without printing its contents; it was replaced by an explicit temporary-file boundary, and the final passing runs use that boundary.
Known limitations: The new command is not installed here, so this pass uses the sibling design's root `bun test` command rather than effective config. The suite available in this worktree contains the sender scenarios, not the sibling command suite. Target names are read from config output by the writer and passed explicitly to the sender, avoiding a second YAML parser. Sender dependencies install locally from its lockfile before first use. No actual Discord delivery or live loop was run.
Unverified criteria: Operator-only one-time skill size/rule counting and fresh-agent readability acceptance remain unverified, although all entrypoints are intentionally short and received semantic inspection. Combined live command/skill integration, real worker dispatch and the hands-off merge/check.fix proof belong to `status`; they are not claimed by these tests. All other scoped source deliverables and local checks above are complete.

## Repair round 1 — 2026-09-10

Re-read authoritative state (`check.fix`, `fix_rounds: 1`) and both reviews. A reported no Fix findings. B's F1 was the only required repair. Advisory N1–N4 remain outside this repair.

F1: response-body TypeErrors now become DeliveryError with the target, known HTTP status, redacted diagnostic and request content. This puts body-consumption failures through the existing one-retry and per-target failure handling. Other error types still propagate. No changes to criteria, scope or state.

Added two subprocess regressions with temporary secret files and substituted fetch: a failed response body followed by recovery retries the first target and then delivers to the second; repeated body failure stops after one retry, reports the final status/context with credentials redacted, and still attempts the remaining target. Both regressions failed before the repair (6 pass, 2 fail).

Repair range: `36108aa868b6d0da5e5eef0d7546e43de94b0e43` to `180d4ca803ab1c41f035793b53c2eceeb421c9c4`. Commit: `fix(broadcast): retry response body transport failures`.

Changed files and reasons: `skills/broadcast-issue/scripts/discord-send.ts` handles response-body transport errors within the retry contract; `discord-send.test.ts` verifies recovery, exhaustion, continuation and redaction for that failure path.
Tests run: Root `bun test`: 8 pass, 0 fail, 48 assertions, saved in `implementation/fix-round-1-suite.txt`. `bun run --cwd skills/broadcast-issue typecheck`: exit 0. `git diff --check`: exit 0.
Known limitations: No live broadcast or combined command/skill integration was run. Earlier integration and operator-check limitations still apply.
Unverified criteria: None for F1. State remains untouched pending the operator's next phase action.
